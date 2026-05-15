from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from users.services import deliver_email, mask_email_username


class Command(BaseCommand):
    help = "Send a safe test email using the configured Django email backend."

    def add_arguments(self, parser):
        parser.add_argument("recipient", help="Recipient email address for the test message.")

    def handle(self, *args, **options):
        recipient = options["recipient"]

        self.stdout.write(f"EMAIL_BACKEND={settings.EMAIL_BACKEND}")
        self.stdout.write(f"EMAIL_HOST={getattr(settings, 'EMAIL_HOST', '')}")
        self.stdout.write(f"EMAIL_PORT={getattr(settings, 'EMAIL_PORT', '')}")
        self.stdout.write(f"EMAIL_USE_TLS={getattr(settings, 'EMAIL_USE_TLS', False)}")
        self.stdout.write(f"EMAIL_USE_SSL={getattr(settings, 'EMAIL_USE_SSL', False)}")
        self.stdout.write(
            "EMAIL_HOST_USER="
            f"{mask_email_username(getattr(settings, 'EMAIL_HOST_USER', ''))}"
        )
        self.stdout.write(f"DEFAULT_FROM_EMAIL={settings.DEFAULT_FROM_EMAIL}")

        result = deliver_email(
            subject="Atlas Travel email delivery test",
            message=(
                "This is a test email from Atlas Travel Agency.\n\n"
                "If you received it, Django email delivery is configured correctly."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
        )

        if result.delivered:
            self.stdout.write(self.style.SUCCESS(f"Test email sent to {recipient}."))
            return

        raise CommandError(f"Email delivery failed: {result.reason}")
