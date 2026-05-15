from dataclasses import dataclass
from datetime import timedelta
import logging
import secrets
from smtplib import SMTPAuthenticationError, SMTPException

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone


logger = logging.getLogger(__name__)
CONSOLE_EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
SMTP_EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"


@dataclass(frozen=True)
class EmailDeliveryResult:
    delivered: bool
    reason: str = ""
    debug_message: str = ""


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


def get_email_configuration_issues():
    if settings.EMAIL_BACKEND != SMTP_EMAIL_BACKEND:
        return []

    issues = []

    if not getattr(settings, "EMAIL_HOST", ""):
        issues.append("EMAIL_HOST is required for SMTP email delivery.")
    elif settings.EMAIL_HOST != "smtp.gmail.com":
        issues.append("EMAIL_HOST should be smtp.gmail.com for Gmail SMTP.")

    if int(getattr(settings, "EMAIL_PORT", 0)) != 587:
        issues.append("EMAIL_PORT must be 587 for Gmail SMTP with TLS.")

    if not getattr(settings, "EMAIL_USE_TLS", False):
        issues.append("EMAIL_USE_TLS must be True for Gmail SMTP.")

    if getattr(settings, "EMAIL_USE_SSL", False):
        issues.append("EMAIL_USE_SSL must be False when using Gmail SMTP with TLS.")

    if not getattr(settings, "EMAIL_HOST_USER", ""):
        issues.append("EMAIL_HOST_USER is required for SMTP email delivery.")

    if not getattr(settings, "EMAIL_HOST_PASSWORD", ""):
        issues.append("EMAIL_HOST_PASSWORD is required for SMTP email delivery.")

    default_from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "")

    if not default_from_email or "@" not in default_from_email:
        issues.append("DEFAULT_FROM_EMAIL must be a valid sender email address.")

    return issues


def deliver_email(subject, message, recipient_list, from_email=None):
    configuration_issues = get_email_configuration_issues()

    if configuration_issues:
        reason = " ".join(configuration_issues)
        logger.warning("Email delivery configuration issue: %s", reason)
        return EmailDeliveryResult(delivered=False, reason=reason)

    try:
        sent_count = send_mail(
            subject=subject,
            message=message,
            from_email=from_email or settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
    except SMTPAuthenticationError as exc:
        reason = f"SMTP authentication failed: {exc}"
        logger.warning("Email delivery failed: %s", reason)
        return EmailDeliveryResult(delivered=False, reason=reason)
    except SMTPException as exc:
        reason = f"SMTP error: {exc}"
        logger.warning("Email delivery failed: %s", reason)
        return EmailDeliveryResult(delivered=False, reason=reason)
    except Exception as exc:
        reason = f"{exc.__class__.__name__}: {exc}"
        logger.exception("Email backend exception: %s", reason)
        return EmailDeliveryResult(delivered=False, reason=reason)

    if sent_count:
        return EmailDeliveryResult(delivered=True)

    reason = "Email backend reported 0 messages sent."
    logger.warning("Email delivery failed: %s", reason)
    return EmailDeliveryResult(delivered=False, reason=reason)


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
    delivery_result = deliver_email(
        subject=subject,
        message=message,
        from_email=from_email,
        recipient_list=recipient_list,
    )

    if delivery_result.delivered:
        logger.info("Verification email sent successfully to: %s", recipient_email)
        if settings.EMAIL_BACKEND == CONSOLE_EMAIL_BACKEND:
            reason = (
                "Console email backend is active; the verification email was "
                "printed to the backend terminal instead of being sent."
            )
            logger.info(
                "Verification email delivery note for %s: %s",
                recipient_email,
                reason,
            )
            return EmailDeliveryResult(
                delivered=True,
                reason=reason,
                debug_message=(
                    "Verification code generated. Console email backend is active, "
                    "so the code was printed in the backend terminal."
                ),
            )
        return EmailDeliveryResult(delivered=True)

    logger.warning(
        "Verification email delivery failed for %s: %s",
        recipient_email,
        delivery_result.reason,
    )
    return delivery_result


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
