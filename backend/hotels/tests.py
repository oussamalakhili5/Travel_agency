from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User

from .models import Hotel


class AdminHotelApiTests(APITestCase):
    def setUp(self):
        self.url = reverse("admin-hotel-list")
        self.admin_user = User.objects.create_user(
            email="admin-hotels@example.com",
            password="TravelPass123!",
            first_name="Admin",
            last_name="Hotels",
            phone="+212600000300",
            role=User.Role.ADMIN,
            is_email_verified=True,
        )
        self.regular_user = User.objects.create_user(
            email="user-hotels@example.com",
            password="TravelPass123!",
            first_name="Regular",
            last_name="Hotels",
            phone="+212600000301",
            is_email_verified=True,
        )
        self.active_hotel = Hotel.objects.create(
            name="Atlas Marina Hotel",
            city="Casablanca",
            address="Boulevard de la Corniche",
            description="Seaside hotel",
            price_per_night=180,
            rating=4.6,
            number_of_rooms=50,
            available_rooms=15,
            image="https://example.com/atlas-marina.jpg",
            is_active=True,
        )
        self.inactive_hotel = Hotel.objects.create(
            name="Desert Pearl Retreat",
            city="Marrakech",
            address="Palm Grove Road",
            description="Quiet riad stay",
            price_per_night=230,
            rating=4.8,
            number_of_rooms=22,
            available_rooms=0,
            image="https://example.com/desert-pearl.jpg",
            is_active=False,
        )

    def test_admin_can_list_all_hotels(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(
            {hotel["id"] for hotel in response.data},
            {self.active_hotel.id, self.inactive_hotel.id},
        )
        self.assertEqual(
            set(response.data[0].keys()),
            {
                "id",
                "name",
                "city",
                "address",
                "price_per_night",
                "rating",
                "available_rooms",
                "number_of_rooms",
                "is_active",
                "updated_at",
            },
        )

    def test_regular_user_is_denied(self):
        self.client.force_authenticate(self.regular_user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_is_denied(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
