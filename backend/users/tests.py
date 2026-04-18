from datetime import timedelta

from django.core import mail
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class EmailVerificationFlowTests(APITestCase):
    def setUp(self):
        self.register_url = reverse("auth-register")
        self.verify_url = reverse("auth-verify-email")
        self.resend_url = reverse("auth-resend-verification-code")
        self.login_url = reverse("auth-login")

    def test_registration_creates_unverified_user_and_sends_code(self):
        payload = {
            "email": "traveler@example.com",
            "first_name": "Atlas",
            "last_name": "Traveler",
            "phone": "+212600000000",
            "password": "TravelPass123!",
            "confirm_password": "TravelPass123!",
        }

        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="traveler@example.com")
        self.assertFalse(user.is_email_verified)
        self.assertIsNotNone(user.email_verification_code)
        self.assertIsNotNone(user.email_verification_expires_at)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(user.email_verification_code, mail.outbox[0].body)

    def test_verify_email_marks_user_as_verified_and_clears_code(self):
        user = User.objects.create_user(
            email="verify@example.com",
            password="TravelPass123!",
            first_name="Verify",
            last_name="User",
            phone="+212600000001",
        )
        user.set_email_verification(
            code="123456",
            expires_at=timezone.now() + timedelta(minutes=15),
        )

        response = self.client.post(
            self.verify_url,
            {"email": user.email, "verification_code": "123456"},
            format="json",
        )

        user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(user.is_email_verified)
        self.assertIsNone(user.email_verification_code)
        self.assertIsNone(user.email_verification_expires_at)

    def test_verify_email_rejects_expired_code(self):
        user = User.objects.create_user(
            email="expired@example.com",
            password="TravelPass123!",
            first_name="Expired",
            last_name="User",
            phone="+212600000002",
        )
        user.set_email_verification(
            code="654321",
            expires_at=timezone.now() - timedelta(minutes=1),
        )

        response = self.client.post(
            self.verify_url,
            {"email": user.email, "verification_code": "654321"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("verification_code", response.data)

    def test_resend_verification_code_replaces_code_for_unverified_user(self):
        user = User.objects.create_user(
            email="resend@example.com",
            password="TravelPass123!",
            first_name="Resend",
            last_name="User",
            phone="+212600000003",
        )
        user.set_email_verification(
            code="111111",
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        previous_expiry = user.email_verification_expires_at

        response = self.client.post(
            self.resend_url,
            {"email": user.email},
            format="json",
        )

        user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(user.email_verification_code, "111111")
        self.assertGreater(user.email_verification_expires_at, previous_expiry)
        self.assertEqual(len(mail.outbox), 1)

    def test_resend_verification_code_returns_generic_response_for_unknown_email(self):
        response = self.client.post(
            self.resend_url,
            {"email": "unknown@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_login_requires_email_verification(self):
        user = User.objects.create_user(
            email="login@example.com",
            password="TravelPass123!",
            first_name="Login",
            last_name="User",
            phone="+212600000004",
        )
        user.set_email_verification(
            code="222222",
            expires_at=timezone.now() + timedelta(minutes=15),
        )

        response = self.client.post(
            self.login_url,
            {"email": user.email, "password": "TravelPass123!"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["code"], "email_verification_required")

    def test_verified_user_can_log_in(self):
        user = User.objects.create_user(
            email="verified@example.com",
            password="TravelPass123!",
            first_name="Verified",
            last_name="User",
            phone="+212600000005",
            is_email_verified=True,
        )

        response = self.client.post(
            self.login_url,
            {"email": user.email, "password": "TravelPass123!"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
