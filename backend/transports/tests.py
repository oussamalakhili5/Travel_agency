from datetime import timedelta
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User

from .models import Transport


class AdminTransportApiTests(APITestCase):
    def setUp(self):
        self.url = reverse("admin-transport-list")
        self.admin_user = User.objects.create_user(
            email="admin-transports@example.com",
            password="TravelPass123!",
            first_name="Admin",
            last_name="Transports",
            phone="+212600000400",
            role=User.Role.ADMIN,
            is_email_verified=True,
        )
        self.regular_user = User.objects.create_user(
            email="user-transports@example.com",
            password="TravelPass123!",
            first_name="Regular",
            last_name="Transports",
            phone="+212600000401",
            is_email_verified=True,
        )
        self.active_transport = Transport.objects.create(
            type=Transport.TransportType.FLIGHT,
            company="Atlas Air Connect",
            departure_city="Casablanca",
            arrival_city="Istanbul",
            departure_time=timezone.now() + timedelta(days=2),
            arrival_time=timezone.now() + timedelta(days=2, hours=5),
            price=410,
            available_seats=28,
            total_seats=160,
            service_class=Transport.ServiceClass.BUSINESS,
            is_active=True,
        )
        self.inactive_transport = Transport.objects.create(
            type=Transport.TransportType.TRAIN,
            company="Maghreb Rail",
            departure_city="Rabat",
            arrival_city="Tangier",
            departure_time=timezone.now() + timedelta(days=3),
            arrival_time=timezone.now() + timedelta(days=3, hours=2),
            price=65,
            available_seats=0,
            total_seats=80,
            service_class=Transport.ServiceClass.ECONOMY,
            is_active=False,
        )

    def test_admin_can_list_all_transports(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(
            {transport["id"] for transport in response.data},
            {self.active_transport.id, self.inactive_transport.id},
        )
        self.assertEqual(
            set(response.data[0].keys()),
            {
                "id",
                "type",
                "company",
                "departure_city",
                "arrival_city",
                "departure_time",
                "arrival_time",
                "price",
                "available_seats",
                "total_seats",
                "service_class",
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
