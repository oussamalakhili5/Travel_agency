from datetime import timedelta
import secrets

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone


def generate_email_verification_code():
    return f"{secrets.randbelow(1_000_000):06d}"


def get_email_verification_expiry():
    return timezone.now() + timedelta(
        minutes=settings.EMAIL_VERIFICATION_CODE_TTL_MINUTES
    )


def send_email_verification_message(user):
    send_mail(
        subject="Verify your Atlas Travel account",
        message=(
            f"Hello {user.full_name or user.email},\n\n"
            "Use the verification code below to verify your email address:\n\n"
            f"{user.email_verification_code}\n\n"
            f"This code expires in {settings.EMAIL_VERIFICATION_CODE_TTL_MINUTES} minutes.\n\n"
            "If you did not create this account, you can ignore this email."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


def issue_email_verification(user):
    code = generate_email_verification_code()
    expires_at = get_email_verification_expiry()

    user.set_email_verification(code=code, expires_at=expires_at)
    send_email_verification_message(user)

    return code
