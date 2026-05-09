from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models


class Package(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    destination = models.CharField(max_length=120, db_index=True)
    city = models.CharField(max_length=120, db_index=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Package price per traveler.",
    )
    duration_days = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    image_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["destination", "title"]
        verbose_name = "Package"
        verbose_name_plural = "Packages"
        indexes = [
            models.Index(fields=["destination", "is_active"]),
            models.Index(fields=["city", "is_active"]),
            models.Index(fields=["price"]),
        ]

    def __str__(self):
        return f"{self.title} - {self.destination}"

    def clean(self):
        super().clean()

        if self.start_date and self.end_date and self.end_date <= self.start_date:
            raise ValidationError(
                {"end_date": "End date must be later than start date."}
            )
