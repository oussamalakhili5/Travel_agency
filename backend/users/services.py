from datetime import timedelta
import logging
import secrets

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone


logger = logging.getLogger(__name__)


def generate_email_verification_code():
    return f"{secrets.randbelow(1_000_000):06d}"


def get_email_verification_expiry():
    return timezone.now() + timedelta(
        minutes=settings.EMAIL_VERIFICATION_CODE_TTL_MINUTES
    )


def mask_email_username(value):
    if not value:
        return "[not set]"

    if "@" not in value:
        return "***"

    local_part, domain = value.split("@", 1)

    if len(local_part) <= 2:
        masked_local = local_part[0] + "*"
    else:
        masked_local = local_part[:2] + "***"

    return f"{masked_local}@{domain}"


def send_email_verification_message(user):
    logger.info("Email backend loaded: %s", settings.EMAIL_BACKEND)
    logger.info("Email host loaded: %s", getattr(settings, "EMAIL_HOST", ""))
    logger.info("Email port loaded: %s", getattr(settings, "EMAIL_PORT", ""))
    logger.info("Email TLS enabled: %s", getattr(settings, "EMAIL_USE_TLS", False))
    logger.info("Email SSL enabled: %s", getattr(settings, "EMAIL_USE_SSL", False))
    logger.info("Default from email: %s", settings.DEFAULT_FROM_EMAIL)
    logger.info(
        "Email host user loaded: %s",
        mask_email_username(getattr(settings, "EMAIL_HOST_USER", "")),
    )
    logger.info("Sending verification email to: %s", user.email)
    subject = "Verify your Atlas Travel account"
    message = (
        f"Hello {user.full_name or user.email},\n\n"
        "Use the verification code below to verify your email address:\n\n"
        f"{user.email_verification_code}\n\n"
        f"This code expires in {settings.EMAIL_VERIFICATION_CODE_TTL_MINUTES} minutes.\n\n"
        "If you did not create this account, you can ignore this email."
    )
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]

    logger.info("Attempting send_mail call with fail_silently=False")
    send_mail(
        subject=subject,
        message=message,
        from_email=from_email,
        recipient_list=recipient_list,
        fail_silently=False,
    )


def issue_email_verification(user):
    code = generate_email_verification_code()
    expires_at = get_email_verification_expiry()
    logger.info("Verification code generated for: %s", user.email)
    logger.info("Verification code: %s", code)

    user.set_email_verification(code=code, expires_at=expires_at)
    logger.info(
        "Verification fields saved: code=%s expires_at=%s is_email_verified=%s",
        user.email_verification_code,
        user.email_verification_expires_at,
        user.is_email_verified,
    )
    send_email_verification_message(user)

    return code
