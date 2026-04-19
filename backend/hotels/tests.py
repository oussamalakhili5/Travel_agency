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
        self.detail_url = reverse("admin-hotel-detail", kwargs={"pk": self.active_hotel.pk})

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
                "description",
                "city",
                "address",
                "price_per_night",
                "rating",
                "available_rooms",
                "number_of_rooms",
                "image",
                "is_active",
                "created_at",
                "updated_at",
            },
        )

    def test_admin_can_create_hotel(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.post(
            self.url,
            {
                "name": "Skyline Lounge Hotel",
                "city": "Doha",
                "address": "West Bay Avenue",
                "description": "Business travel friendly stay",
                "price_per_night": "320.00",
                "rating": "4.50",
                "available_rooms": 18,
                "number_of_rooms": 30,
                "image": "https://example.com/skyline-lounge.jpg",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Hotel.objects.filter(name="Skyline Lounge Hotel").exists())

    def test_admin_can_update_hotel(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.put(
            self.detail_url,
            {
                "name": self.active_hotel.name,
                "city": "Casablanca",
                "address": self.active_hotel.address,
                "description": "Updated hotel description",
                "price_per_night": "215.00",
                "rating": "4.70",
                "available_rooms": 12,
                "number_of_rooms": 50,
                "image": self.active_hotel.image,
                "is_active": False,
            },
            format="json",
        )

        self.active_hotel.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.active_hotel.description, "Updated hotel description")
        self.assertEqual(str(self.active_hotel.price_per_night), "215.00")
        self.assertFalse(self.active_hotel.is_active)

    def test_admin_can_delete_hotel(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Hotel.objects.filter(pk=self.active_hotel.pk).exists())

    def test_create_hotel_rejects_invalid_room_counts(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.post(
            self.url,
            {
                "name": "Invalid Inventory Hotel",
                "city": "Fez",
                "address": "Old City Road",
                "description": "Bad room counts",
                "price_per_night": "140.00",
                "rating": "4.00",
                "available_rooms": 21,
                "number_of_rooms": 20,
                "image": "",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("available_rooms", response.data)

    def test_regular_user_is_denied(self):
        self.client.force_authenticate(self.regular_user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_regular_user_cannot_create_hotel(self):
        self.client.force_authenticate(self.regular_user)

        response = self.client.post(
            self.url,
            {
                "name": "Forbidden Hotel",
                "city": "Rome",
                "address": "City Center",
                "description": "Should not be created",
                "price_per_night": "150.00",
                "rating": "4.00",
                "available_rooms": 5,
                "number_of_rooms": 10,
                "image": "",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_is_denied(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_user_cannot_delete_hotel(self):
        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
