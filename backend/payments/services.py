from decimal import Decimal

from django.utils import timezone

from reservations.models import Reservation

from .models import Payment, build_payment_reference


def calculate_reservation_amount(reservation):
    if reservation.reservation_type == Reservation.ReservationType.HOTEL and reservation.hotel:
        nights = 1

        if reservation.check_in_date and reservation.check_out_date:
            nights = max((reservation.check_out_date - reservation.check_in_date).days, 1)

        rooms = reservation.rooms_reserved or 1
        return reservation.hotel.price_per_night * Decimal(nights) * Decimal(rooms)

    if (
        reservation.reservation_type == Reservation.ReservationType.TRANSPORT
        and reservation.transport
    ):
        passengers = reservation.passengers_count or 1
        return reservation.transport.price * Decimal(passengers)

    if reservation.reservation_type == Reservation.ReservationType.PACKAGE and reservation.package:
        guests = reservation.guests_count or 1
        return reservation.package.price * Decimal(guests)

    return Decimal("0.00")


def create_mock_payment_for_reservation(user, reservation, method=Payment.Method.MOCK_CARD):
    amount = calculate_reservation_amount(reservation)

    payment = Payment.objects.create(
        user=user,
        reservation=reservation,
        amount=amount,
        currency="USD",
        method=method,
        status=Payment.Status.PENDING,
    )
    Reservation.objects.filter(pk=reservation.pk).update(
        payment_status=Reservation.PaymentStatus.PENDING,
        updated_at=timezone.now(),
    )
    reservation.payment_status = Reservation.PaymentStatus.PENDING

    return payment


def mark_payment_paid(payment):
    if payment.status == Payment.Status.PAID:
        return payment

    payment.status = Payment.Status.PAID
    payment.transaction_id = payment.transaction_id or build_payment_reference()
    payment.failure_reason = ""
    payment.save(update_fields=["status", "transaction_id", "failure_reason", "updated_at"])
    Reservation.objects.filter(pk=payment.reservation_id).update(
        status=Reservation.Status.CONFIRMED,
        payment_status=Reservation.PaymentStatus.PAID,
        updated_at=timezone.now(),
    )

    return payment


def mark_payment_failed(payment, reason="Mock payment failed."):
    payment.status = Payment.Status.FAILED
    payment.failure_reason = reason
    payment.save(update_fields=["status", "failure_reason", "updated_at"])
    Reservation.objects.filter(pk=payment.reservation_id).update(
        payment_status=Reservation.PaymentStatus.FAILED,
        updated_at=timezone.now(),
    )

    return payment


def mark_payment_cancelled(payment):
    payment.status = Payment.Status.CANCELLED
    payment.failure_reason = "Payment was cancelled."
    payment.save(update_fields=["status", "failure_reason", "updated_at"])
    Reservation.objects.filter(pk=payment.reservation_id).update(
        payment_status=Reservation.PaymentStatus.CANCELLED,
        updated_at=timezone.now(),
    )

    return payment
