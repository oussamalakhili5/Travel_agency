from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import F, Q


class Reservation(models.Model):
    class ReservationType(models.TextChoices):
        HOTEL = "hotel", "Hotel"
        TRANSPORT = "transport", "Transport"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reservations",
    )
    hotel = models.ForeignKey(
        "hotels.Hotel",
        on_delete=models.PROTECT,
        related_name="reservations",
        null=True,
        blank=True,
    )
    transport = models.ForeignKey(
        "transports.Transport",
        on_delete=models.PROTECT,
        related_name="reservations",
        null=True,
        blank=True,
    )
    reservation_type = models.CharField(
        max_length=20,
        choices=ReservationType.choices,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    check_in_date = models.DateField(null=True, blank=True)
    check_out_date = models.DateField(null=True, blank=True)
    guests_count = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
    )
    rooms_reserved = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
    )
    passengers_count = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
    )
    special_request = models.TextField(blank=True)
    reserved_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-reserved_at"]
        verbose_name = "Reservation"
        verbose_name_plural = "Reservations"
        constraints = [
            models.CheckConstraint(
                check=(
                    (Q(reservation_type="hotel") & Q(hotel__isnull=False) & Q(transport__isnull=True))
                    | (
                        Q(reservation_type="transport")
                        & Q(hotel__isnull=True)
                        & Q(transport__isnull=False)
                    )
                ),
                name="reservation_type_matches_related_object",
            ),
            models.CheckConstraint(
                check=(
                    Q(check_in_date__isnull=True)
                    | Q(check_out_date__isnull=True)
                    | Q(check_out_date__gt=F("check_in_date"))
                ),
                name="reservation_checkout_after_checkin",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["reservation_type", "status"]),
            models.Index(fields=["reserved_at"]),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.get_reservation_type_display()} ({self.get_status_display()})"

    def cancel(self):
        if self.status == self.Status.CANCELLED:
            raise ValidationError(
                {"status": "This reservation has already been cancelled."}
            )

        self.status = self.Status.CANCELLED
        self.save(update_fields=["status", "updated_at"])

    @property
    def related_item(self):
        if self.reservation_type == self.ReservationType.HOTEL:
            return self.hotel

        if self.reservation_type == self.ReservationType.TRANSPORT:
            return self.transport

        return None

    def clean(self):
        super().clean()

        errors = {}

        if self.reservation_type == self.ReservationType.HOTEL:
            if not self.hotel or self.transport:
                errors["hotel"] = "Hotel reservations must be linked to a hotel only."

            if not self.check_in_date:
                errors["check_in_date"] = "Check-in date is required for hotel reservations."

            if not self.check_out_date:
                errors["check_out_date"] = "Check-out date is required for hotel reservations."

            if self.check_in_date and self.check_out_date and self.check_out_date <= self.check_in_date:
                errors["check_out_date"] = "Check-out date must be later than check-in date."

            if not self.guests_count:
                errors["guests_count"] = "Guests count is required for hotel reservations."

            if not self.rooms_reserved:
                errors["rooms_reserved"] = "Rooms reserved is required for hotel reservations."

            if self.passengers_count:
                errors["passengers_count"] = "Passengers count cannot be set for hotel reservations."

        elif self.reservation_type == self.ReservationType.TRANSPORT:
            if not self.transport or self.hotel:
                errors["transport"] = "Transport reservations must be linked to a transport only."

            if not self.passengers_count:
                errors["passengers_count"] = "Passengers count is required for transport reservations."

            if self.check_in_date:
                errors["check_in_date"] = "Check-in date is only valid for hotel reservations."

            if self.check_out_date:
                errors["check_out_date"] = "Check-out date is only valid for hotel reservations."

            if self.guests_count:
                errors["guests_count"] = "Guests count is only valid for hotel reservations."

            if self.rooms_reserved:
                errors["rooms_reserved"] = "Rooms reserved is only valid for hotel reservations."

        else:
            errors["reservation_type"] = "A valid reservation type is required."

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
