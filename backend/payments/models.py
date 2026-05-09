import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models


def build_payment_reference():
    return f"MOCK-{uuid.uuid4().hex[:12].upper()}"


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"

    class Method(models.TextChoices):
        MOCK_CARD = "mock_card", "Mock card"
        MOCK_CASH = "mock_cash", "Mock cash"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    reservation = models.ForeignKey(
        "reservations.Reservation",
        on_delete=models.CASCADE,
        related_name="payments",
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    currency = models.CharField(max_length=3, default="USD")
    method = models.CharField(
        max_length=30,
        choices=Method.choices,
        default=Method.MOCK_CARD,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    reference_id = models.CharField(
        max_length=40,
        unique=True,
        default=build_payment_reference,
    )
    transaction_id = models.CharField(max_length=80, blank=True)
    provider = models.CharField(max_length=30, default="mock")
    failure_reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["reservation", "status"]),
            models.Index(fields=["reference_id"]),
        ]

    def __str__(self):
        return f"{self.reference_id} - {self.user.email} ({self.get_status_display()})"

    def clean(self):
        super().clean()

        if self.reservation_id and self.user_id:
            reservation_user_id = getattr(self.reservation, "user_id", None)

            if reservation_user_id and reservation_user_id != self.user_id:
                raise ValidationError(
                    {"reservation": "Payment reservation must belong to the payment user."}
                )
