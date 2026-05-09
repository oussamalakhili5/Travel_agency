from datetime import date

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from hotels.models import Hotel
from reservations.models import Reservation
from users.models import User

from .models import Payment


class PaymentApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="payment-user@example.com",
            password="TravelPass123!",
            first_name="Payment",
            last_name="User",
            phone="+212600000800",
            is_email_verified=True,
        )
        self.other_user = User.objects.create_user(
            email="payment-other@example.com",
            password="TravelPass123!",
            first_name="Other",
            last_name="Payment",
            phone="+212600000801",
            is_email_verified=True,
        )
        self.admin_user = User.objects.create_user(
            email="payment-admin@example.com",
            password="TravelPass123!",
            first_name="Admin",
            last_name="Payment",
            phone="+212600000802",
            role=User.Role.ADMIN,
            is_email_verified=True,
        )
        self.hotel = Hotel.objects.create(
            name="Payment Hotel",
            city="Casablanca",
            address="Finance Avenue",
            description="A test hotel for payment calculations.",
            price_per_night=100,
            rating=4.5,
            number_of_rooms=20,
            available_rooms=5,
        )
        self.reservation = Reservation.objects.create(
            user=self.user,
            hotel=self.hotel,
            reservation_type=Reservation.ReservationType.HOTEL,
            check_in_date=date(2026, 6, 1),
            check_out_date=date(2026, 6, 4),
            guests_count=2,
            rooms_reserved=1,
        )
        self.other_reservation = Reservation.objects.create(
            user=self.other_user,
            hotel=self.hotel,
            reservation_type=Reservation.ReservationType.HOTEL,
            check_in_date=date(2026, 7, 1),
            check_out_date=date(2026, 7, 3),
            guests_count=1,
            rooms_reserved=1,
        )
        self.list_url = reverse("payment-list-create")

    def test_authentication_is_required(self):
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_create_mock_payment_for_own_reservation(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {"reservation": self.reservation.id, "method": Payment.Method.MOCK_CARD},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], Payment.Status.PENDING)
        self.assertEqual(response.data["amount"], "300.00")
        self.assertEqual(Payment.objects.get().user, self.user)

    def test_user_cannot_create_payment_for_another_users_reservation(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {"reservation": self.other_reservation.id, "method": Payment.Method.MOCK_CARD},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Payment.objects.count(), 0)

    def test_confirm_payment_updates_reservation_status(self):
        payment = Payment.objects.create(
            user=self.user,
            reservation=self.reservation,
            amount=300,
            currency="USD",
            method=Payment.Method.MOCK_CARD,
        )
        self.client.force_authenticate(self.user)

        response = self.client.post(
            reverse("payment-confirm", kwargs={"pk": payment.pk}),
            format="json",
        )

        self.reservation.refresh_from_db()
        payment.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(payment.status, Payment.Status.PAID)
        self.assertEqual(self.reservation.status, Reservation.Status.CONFIRMED)
        self.assertEqual(self.reservation.payment_status, Reservation.PaymentStatus.PAID)

    def test_user_cannot_confirm_another_users_payment(self):
        payment = Payment.objects.create(
            user=self.other_user,
            reservation=self.other_reservation,
            amount=200,
            currency="USD",
            method=Payment.Method.MOCK_CARD,
        )
        self.client.force_authenticate(self.user)

        response = self.client.post(
            reverse("payment-confirm", kwargs={"pk": payment.pk}),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_fail_payment_updates_payment_status(self):
        payment = Payment.objects.create(
            user=self.user,
            reservation=self.reservation,
            amount=300,
            currency="USD",
            method=Payment.Method.MOCK_CARD,
        )
        self.client.force_authenticate(self.user)

        response = self.client.post(
            reverse("payment-fail", kwargs={"pk": payment.pk}),
            {"reason": "Card declined in mock flow."},
            format="json",
        )

        self.reservation.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Payment.Status.FAILED)
        self.assertEqual(
            self.reservation.payment_status,
            Reservation.PaymentStatus.FAILED,
        )

    def test_list_returns_only_current_users_payments(self):
        own_payment = Payment.objects.create(
            user=self.user,
            reservation=self.reservation,
            amount=300,
            currency="USD",
            method=Payment.Method.MOCK_CARD,
        )
        Payment.objects.create(
            user=self.other_user,
            reservation=self.other_reservation,
            amount=200,
            currency="USD",
            method=Payment.Method.MOCK_CARD,
        )
        self.client.force_authenticate(self.user)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], own_payment.id)

    def test_admin_can_list_payments(self):
        Payment.objects.create(
            user=self.user,
            reservation=self.reservation,
            amount=300,
            currency="USD",
            method=Payment.Method.MOCK_CARD,
        )
        self.client.force_authenticate(self.admin_user)

        response = self.client.get(reverse("admin-payment-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["user_email"], self.user.email)
