from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("email",)
    list_display = (
        "email",
        "first_name",
        "last_name",
        "role",
        "is_email_verified",
        "is_active",
        "is_staff",
        "date_joined",
    )
    list_filter = ("role", "is_email_verified", "is_active", "is_staff", "is_superuser")
    search_fields = ("email", "first_name", "last_name", "phone")
    readonly_fields = (
        "email_verification_code",
        "email_verification_expires_at",
        "date_joined",
        "last_login",
    )

    fieldsets = (
        ("Authentication", {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "phone")}),
        (
            "Verification",
            {
                "fields": (
                    "is_email_verified",
                    "email_verification_code",
                    "email_verification_expires_at",
                )
            },
        ),
        ("Permissions", {"fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "phone",
                    "role",
                    "is_email_verified",
                    "password1",
                    "password2",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )
