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
        self.detail_url = reverse(
            "admin-transport-detail",
            kwargs={"pk": self.active_transport.pk},
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
                "duration",
                "price",
                "available_seats",
                "total_seats",
                "service_class",
                "notes",
                "is_active",
                "created_at",
                "updated_at",
            },
        )

    def test_admin_can_create_transport(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.post(
            self.url,
            {
                "type": Transport.TransportType.BUS,
                "company": "Atlas Coach",
                "departure_city": "Agadir",
                "arrival_city": "Marrakech",
                "departure_time": (timezone.now() + timedelta(days=4)).isoformat(),
                "arrival_time": (timezone.now() + timedelta(days=4, hours=3)).isoformat(),
                "price": "45.00",
                "available_seats": 22,
                "total_seats": 40,
                "service_class": Transport.ServiceClass.VIP,
                "notes": "Direct express coach",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Transport.objects.filter(company="Atlas Coach").exists())

    def test_admin_can_update_transport(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.put(
            self.detail_url,
            {
                "type": self.active_transport.type,
                "company": "Atlas Air Executive",
                "departure_city": self.active_transport.departure_city,
                "arrival_city": self.active_transport.arrival_city,
                "departure_time": self.active_transport.departure_time.isoformat(),
                "arrival_time": self.active_transport.arrival_time.isoformat(),
                "price": "455.00",
                "available_seats": 20,
                "total_seats": 160,
                "service_class": Transport.ServiceClass.FIRST,
                "notes": "Updated premium cabin",
                "is_active": False,
            },
            format="json",
        )

        self.active_transport.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.active_transport.company, "Atlas Air Executive")
        self.assertEqual(str(self.active_transport.price), "455.00")
        self.assertFalse(self.active_transport.is_active)

    def test_admin_can_delete_transport(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Transport.objects.filter(pk=self.active_transport.pk).exists())

    def test_create_transport_rejects_invalid_timing(self):
        self.client.force_authenticate(self.admin_user)

        departure_time = timezone.now() + timedelta(days=6)

        response = self.client.post(
            self.url,
            {
                "type": Transport.TransportType.TRAIN,
                "company": "Invalid Rail",
                "departure_city": "Paris",
                "arrival_city": "Lyon",
                "departure_time": departure_time.isoformat(),
                "arrival_time": departure_time.isoformat(),
                "price": "60.00",
                "available_seats": 20,
                "total_seats": 60,
                "service_class": Transport.ServiceClass.ECONOMY,
                "notes": "",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("arrival_time", response.data)

    def test_regular_user_is_denied(self):
        self.client.force_authenticate(self.regular_user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_regular_user_cannot_update_transport(self):
        self.client.force_authenticate(self.regular_user)

        response = self.client.put(
            self.detail_url,
            {
                "type": self.active_transport.type,
                "company": self.active_transport.company,
                "departure_city": self.active_transport.departure_city,
                "arrival_city": self.active_transport.arrival_city,
                "departure_time": self.active_transport.departure_time.isoformat(),
                "arrival_time": self.active_transport.arrival_time.isoformat(),
                "price": str(self.active_transport.price),
                "available_seats": self.active_transport.available_seats,
                "total_seats": self.active_transport.total_seats,
                "service_class": self.active_transport.service_class,
                "notes": "",
                "is_active": self.active_transport.is_active,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_is_denied(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_user_cannot_delete_transport(self):
        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
