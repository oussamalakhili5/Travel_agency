from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User


class ChatbotApiTests(APITestCase):
    def setUp(self):
        self.url = reverse("chatbot")

    def assert_chatbot_response_shape(self, response):
        self.assertIn("message", response.data)
        self.assertIn("intent", response.data)
        self.assertIn("reply", response.data)
        self.assertIn("redirect", response.data)
        self.assertIn("requires_auth", response.data)
        self.assertIn("entities", response.data)
        self.assertIn("quick_actions", response.data)
        self.assertIn("suggestions", response.data)
        self.assertIsInstance(response.data["entities"], dict)
        self.assertIsInstance(response.data["quick_actions"], list)
        self.assertIsInstance(response.data["suggestions"], list)

    def test_hotel_intent_returns_hotels_redirect_and_city(self):
        response = self.client.post(
            self.url,
            {"message": "I want a hotel in Paris"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_chatbot_response_shape(response)
        self.assertEqual(response.data["intent"], "hotel_search")
        self.assertEqual(response.data["redirect"]["path"], "/hotels")
        self.assertEqual(response.data["redirect"]["params"], {"city": "Paris"})
        self.assertEqual(response.data["entities"]["city"], "Paris")
        self.assertEqual(response.data["entities"]["item_type"], "hotel")
        self.assertGreater(len(response.data["quick_actions"]), 0)
        self.assertGreater(len(response.data["suggestions"]), 0)

    def test_transport_intent_extracts_route(self):
        response = self.client.post(
            self.url,
            {"message": "Show me a flight from Casablanca to Madrid"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_chatbot_response_shape(response)
        self.assertEqual(response.data["intent"], "transport_search")
        self.assertEqual(response.data["redirect"]["path"], "/transports")
        self.assertEqual(
            response.data["redirect"]["params"],
            {
                "departure_city": "Casablanca",
                "arrival_city": "Madrid",
                "type": "flight",
            },
        )
        self.assertEqual(response.data["entities"]["transport_type"], "flight")
        self.assertEqual(response.data["entities"]["item_type"], "transport")

    def test_reservation_help_marks_auth_requirement(self):
        user = User.objects.create_user(
            email="chatbot@example.com",
            password="TravelPass123!",
            first_name="Chat",
            last_name="Bot",
            phone="+212600000900",
            is_email_verified=True,
        )
        self.client.force_authenticate(user)

        response = self.client.post(
            self.url,
            {"message": "I need to cancel my reservation"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_chatbot_response_shape(response)
        self.assertEqual(response.data["intent"], "cancellation_help")
        self.assertTrue(response.data["requires_auth"])
        self.assertEqual(response.data["redirect"]["path"], "/my-reservations")
        self.assertEqual(response.data["entities"]["action"], "cancel")

    def test_unauthenticated_reservation_help_redirects_to_login(self):
        response = self.client.post(
            self.url,
            {"message": "Show me my reservations"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_chatbot_response_shape(response)
        self.assertEqual(response.data["intent"], "reservation_help")
        self.assertTrue(response.data["requires_auth"])
        self.assertEqual(response.data["redirect"]["path"], "/login")

    def test_package_intent_returns_packages_redirect_and_destination(self):
        response = self.client.post(
            self.url,
            {"message": "Find a package to Marrakech"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_chatbot_response_shape(response)
        self.assertEqual(response.data["intent"], "package_search")
        self.assertEqual(response.data["redirect"]["path"], "/packages")
        self.assertEqual(
            response.data["redirect"]["params"],
            {"destination": "Marrakech"},
        )
        self.assertEqual(response.data["entities"]["item_type"], "package")

    def test_unauthenticated_payment_help_redirects_to_login(self):
        response = self.client.post(
            self.url,
            {"message": "How do I pay for my reservation?"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_chatbot_response_shape(response)
        self.assertEqual(response.data["intent"], "payment_help")
        self.assertTrue(response.data["requires_auth"])
        self.assertEqual(response.data["redirect"]["path"], "/login")

    def test_authenticated_payment_help_redirects_to_reservations(self):
        user = User.objects.create_user(
            email="chatbot-payment@example.com",
            password="TravelPass123!",
            first_name="Chat",
            last_name="Payment",
            phone="+212600000901",
            is_email_verified=True,
        )
        self.client.force_authenticate(user)

        response = self.client.post(
            self.url,
            {"message": "I need payment help"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_chatbot_response_shape(response)
        self.assertEqual(response.data["intent"], "payment_help")
        self.assertEqual(response.data["redirect"]["path"], "/my-reservations")

    def test_payment_status_requires_auth(self):
        response = self.client.post(
            self.url,
            {"message": "What is my payment status?"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_chatbot_response_shape(response)
        self.assertEqual(response.data["intent"], "payment_status_help")
        self.assertTrue(response.data["requires_auth"])
        self.assertEqual(response.data["redirect"]["path"], "/login")

    def test_resend_verification_intent_redirects_to_verify_email(self):
        response = self.client.post(
            self.url,
            {"message": "Please resend my verification code"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_chatbot_response_shape(response)
        self.assertEqual(response.data["intent"], "resend_verification_help")
        self.assertEqual(response.data["redirect"]["path"], "/verify-email")
        self.assertFalse(response.data["requires_auth"])

    def test_email_verification_intent_redirects_to_verify_email(self):
        response = self.client.post(
            self.url,
            {"message": "I need to verify my email"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_chatbot_response_shape(response)
        self.assertEqual(response.data["intent"], "email_verification_help")
        self.assertEqual(response.data["redirect"]["path"], "/verify-email")
        self.assertFalse(response.data["requires_auth"])

    def test_unknown_message_returns_fallback_with_guidance(self):
        response = self.client.post(
            self.url,
            {"message": "Can you explain loyalty points?"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_chatbot_response_shape(response)
        self.assertEqual(response.data["intent"], "fallback")
        self.assertEqual(response.data["redirect"]["path"], "/")
        self.assertFalse(response.data["requires_auth"])
        self.assertGreater(len(response.data["quick_actions"]), 0)
        self.assertGreater(len(response.data["suggestions"]), 0)

    def test_login_help_redirects_to_login_page(self):
        response = self.client.post(
            self.url,
            {"message": "How do I log in?"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_chatbot_response_shape(response)
        self.assertEqual(response.data["intent"], "login_help")
        self.assertEqual(response.data["redirect"]["path"], "/login")

    def test_message_is_required(self):
        response = self.client.post(
            self.url,
            {"message": ""},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("message", response.data)
