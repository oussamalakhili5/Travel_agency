from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class ChatbotApiTests(APITestCase):
    def setUp(self):
        self.url = reverse("chatbot")

    def test_hotel_intent_returns_hotels_redirect_and_city(self):
        response = self.client.post(
            self.url,
            {"message": "I want a hotel in Paris"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["intent"], "hotel_search")
        self.assertEqual(response.data["redirect"]["path"], "/hotels")
        self.assertEqual(response.data["redirect"]["params"], {"city": "Paris"})
        self.assertEqual(response.data["entities"], {"city": "Paris"})

    def test_transport_intent_extracts_route(self):
        response = self.client.post(
            self.url,
            {"message": "Show me a flight from Casablanca to Madrid"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["intent"], "transport_search")
        self.assertEqual(response.data["redirect"]["path"], "/transports")
        self.assertEqual(
            response.data["redirect"]["params"],
            {
                "departure_city": "Casablanca",
                "arrival_city": "Madrid",
            },
        )

    def test_reservation_help_marks_auth_requirement(self):
        response = self.client.post(
            self.url,
            {"message": "I need to cancel my reservation"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["intent"], "reservation_help")
        self.assertTrue(response.data["requires_auth"])
        self.assertEqual(response.data["redirect"]["path"], "/my-reservations")
        self.assertEqual(response.data["entities"], {"action": "cancel"})

    def test_login_help_redirects_to_login_page(self):
        response = self.client.post(
            self.url,
            {"message": "How do I log in?"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
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
