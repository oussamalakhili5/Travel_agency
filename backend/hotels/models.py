from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import F, Q


class Hotel(models.Model):
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=120, db_index=True)
    address = models.CharField(max_length=255)
    description = models.TextField()
    price_per_night = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text="Hotel rating on a 0 to 5 scale.",
    )
    number_of_rooms = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )
    available_rooms = models.PositiveIntegerField(
        validators=[MinValueValidator(0)],
    )
    image = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["city", "name"]
        verbose_name = "Hotel"
        verbose_name_plural = "Hotels"
        constraints = [
            models.CheckConstraint(
                check=Q(available_rooms__lte=F("number_of_rooms")),
                name="hotel_available_rooms_lte_total_rooms",
            ),
        ]

    def __str__(self):
        return f"{self.name} - {self.city}"
