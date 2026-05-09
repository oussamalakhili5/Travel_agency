from dataclasses import dataclass
from datetime import timedelta
import logging
import secrets
from smtplib import SMTPAuthenticationError, SMTPException

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class EmailDeliveryResult:
    delivered: bool
    reason: str = ""


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

    if not local_part:
        masked_local = "***"
    elif len(local_part) <= 2:
        masked_local = local_part[0] + "*"
    else:
        masked_local = local_part[:2] + "***"

    return f"{masked_local}@{domain}"


def send_email_verification_message(user):
    recipient_email = user.email

    logger.info("Selected email backend: %s", settings.EMAIL_BACKEND)
    logger.info("Email host: %s", getattr(settings, "EMAIL_HOST", ""))
    logger.info("Email port: %s", getattr(settings, "EMAIL_PORT", ""))
    logger.info("Email TLS enabled: %s", getattr(settings, "EMAIL_USE_TLS", False))
    logger.info("Email SSL enabled: %s", getattr(settings, "EMAIL_USE_SSL", False))
    logger.info("Default from email: %s", settings.DEFAULT_FROM_EMAIL)
    logger.info(
        "Masked email host user: %s",
        mask_email_username(getattr(settings, "EMAIL_HOST_USER", "")),
    )
    logger.info("Verification email recipient: %s", recipient_email)

    subject = "Verify your Atlas Travel account"
    message = (
        f"Hello {user.full_name or user.email},\n\n"
        "Use the verification code below to verify your email address:\n\n"
        f"{user.email_verification_code}\n\n"
        f"This code expires in {settings.EMAIL_VERIFICATION_CODE_TTL_MINUTES} minutes.\n\n"
        "If you did not create this account, you can ignore this email."
    )
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [recipient_email]

    logger.info("Attempting send_mail call with fail_silently=False")
    try:
        sent_count = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
    except SMTPAuthenticationError as exc:
        reason = f"SMTP authentication failed: {exc}"
        logger.warning(
            "Verification email delivery failed for %s: %s",
            recipient_email,
            reason,
        )
        return EmailDeliveryResult(delivered=False, reason=reason)
    except SMTPException as exc:
        reason = f"SMTP error: {exc}"
        logger.warning(
            "Verification email delivery failed for %s: %s",
            recipient_email,
            reason,
        )
        return EmailDeliveryResult(delivered=False, reason=reason)
    except Exception as exc:
        reason = f"{exc.__class__.__name__}: {exc}"
        logger.exception(
            "Verification email backend exception for %s: %s",
            recipient_email,
            reason,
        )
        return EmailDeliveryResult(delivered=False, reason=reason)

    if sent_count:
        logger.info("Verification email sent successfully to: %s", recipient_email)
        return EmailDeliveryResult(delivered=True)

    reason = "Email backend reported 0 messages sent."
    logger.warning(
        "Verification email delivery failed for %s: %s",
        recipient_email,
        reason,
    )
    return EmailDeliveryResult(delivered=False, reason=reason)


def issue_email_verification(user):
    code = generate_email_verification_code()
    expires_at = get_email_verification_expiry()
    logger.info("Verification code generated for: %s", user.email)

    if settings.DEBUG:
        logger.info("DEV EMAIL VERIFICATION CODE for %s: %s", user.email, code)

    user.set_email_verification(code=code, expires_at=expires_at)
    logger.info(
        "Verification fields saved for %s: expires_at=%s is_email_verified=%s",
        user.email,
        user.email_verification_expires_at,
        user.is_email_verified,
    )

    return send_email_verification_message(user)
