from secrets import compare_digest

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        USER = "user", "User"
        ADMIN = "admin", "Admin"

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30, blank=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.USER,
    )
    is_email_verified = models.BooleanField(default=False)
    email_verification_code = models.CharField(max_length=20, null=True, blank=True)
    email_verification_expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        ordering = ["email"]
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def set_email_verification(self, code, expires_at, *, commit=True):
        self.is_email_verified = False
        self.email_verification_code = code
        self.email_verification_expires_at = expires_at

        if commit:
            self.save(
                update_fields=[
                    "is_email_verified",
                    "email_verification_code",
                    "email_verification_expires_at",
                ]
            )

    def clear_email_verification(self, *, mark_verified=True, commit=True):
        if mark_verified:
            self.is_email_verified = True

        self.email_verification_code = None
        self.email_verification_expires_at = None

        if commit:
            update_fields = [
                "email_verification_code",
                "email_verification_expires_at",
            ]

            if mark_verified:
                update_fields.append("is_email_verified")

            self.save(update_fields=update_fields)

    def is_email_verification_code_valid(self, code):
        if self.is_email_verified:
            return False

        if not self.email_verification_code or not code:
            return False

        if not self.email_verification_expires_at:
            return False

        if timezone.now() > self.email_verification_expires_at:
            return False

        return compare_digest(self.email_verification_code, str(code).strip())
