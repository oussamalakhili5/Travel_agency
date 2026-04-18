from datetime import timedelta

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import F, Q


class Transport(models.Model):
    class TransportType(models.TextChoices):
        FLIGHT = "flight", "Flight"
        TRAIN = "train", "Train"
        BUS = "bus", "Bus"

    class ServiceClass(models.TextChoices):
        ECONOMY = "economy", "Economy"
        PREMIUM_ECONOMY = "premium_economy", "Premium Economy"
        BUSINESS = "business", "Business"
        FIRST = "first", "First"
        VIP = "vip", "VIP"

    type = models.CharField(max_length=20, choices=TransportType.choices)
    company = models.CharField(max_length=150)
    departure_city = models.CharField(max_length=120, db_index=True)
    arrival_city = models.CharField(max_length=120, db_index=True)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    available_seats = models.PositiveIntegerField(
        validators=[MinValueValidator(0)],
    )
    total_seats = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )
    duration = models.DurationField(
        blank=True,
        null=True,
        help_text="Auto-calculated from departure and arrival times if left empty.",
    )
    service_class = models.CharField(
        max_length=20,
        choices=ServiceClass.choices,
        default=ServiceClass.ECONOMY,
    )
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["departure_time", "company"]
        verbose_name = "Transport"
        verbose_name_plural = "Transports"
        constraints = [
            models.CheckConstraint(
                check=Q(available_seats__lte=F("total_seats")),
                name="transport_available_seats_lte_total_seats",
            ),
            models.CheckConstraint(
                check=Q(arrival_time__gt=F("departure_time")),
                name="transport_arrival_after_departure",
            ),
        ]
        indexes = [
            models.Index(fields=["type", "is_active"]),
            models.Index(fields=["departure_city", "arrival_city"]),
            models.Index(fields=["departure_time"]),
        ]

    def __str__(self):
        return (
            f"{self.get_type_display()} - {self.company} "
            f"({self.departure_city} to {self.arrival_city})"
        )

    def clean(self):
        super().clean()

        if self.arrival_time and self.departure_time and self.arrival_time <= self.departure_time:
            raise ValidationError(
                {"arrival_time": "Arrival time must be later than departure time."}
            )

        if self.available_seats is not None and self.total_seats is not None:
            if self.available_seats > self.total_seats:
                raise ValidationError(
                    {"available_seats": "Available seats cannot exceed total seats."}
                )

        if self.duration is not None and self.duration <= timedelta(0):
            raise ValidationError({"duration": "Duration must be greater than zero."})

    def save(self, *args, **kwargs):
        if self.departure_time and self.arrival_time:
            self.duration = self.arrival_time - self.departure_time

        super().save(*args, **kwargs)
