from datetime import date, timedelta

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from hotels.models import Hotel
from transports.models import Transport
from users.models import User

from .models import Reservation


class ReservationModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="reservation@example.com",
            password="TravelPass123!",
            first_name="Reservation",
            last_name="Tester",
            phone="+212600000100",
            is_email_verified=True,
        )
        self.hotel = Hotel.objects.create(
            name="Atlas Marina Hotel",
            city="Casablanca",
            address="Marina Boulevard",
            description="Waterfront business stay",
            price_per_night=145,
            rating=4.8,
            number_of_rooms=40,
            available_rooms=12,
            image="https://example.com/hotel.jpg",
        )
        self.transport = Transport.objects.create(
            type=Transport.TransportType.FLIGHT,
            company="Atlas Air Connect",
            departure_city="Casablanca",
            arrival_city="Paris",
            departure_time=timezone.now() + timedelta(days=2),
            arrival_time=timezone.now() + timedelta(days=2, hours=3),
            price=180,
            available_seats=42,
            total_seats=120,
            service_class=Transport.ServiceClass.ECONOMY,
            notes="Direct route",
        )

    def test_valid_hotel_reservation_saves(self):
        reservation = Reservation(
            user=self.user,
            hotel=self.hotel,
            reservation_type=Reservation.ReservationType.HOTEL,
            check_in_date=date(2026, 5, 1),
            check_out_date=date(2026, 5, 5),
            guests_count=2,
            rooms_reserved=1,
        )

        reservation.full_clean()
        reservation.save()

        self.assertEqual(Reservation.objects.count(), 1)

    def test_valid_transport_reservation_saves(self):
        reservation = Reservation(
            user=self.user,
            transport=self.transport,
            reservation_type=Reservation.ReservationType.TRANSPORT,
            passengers_count=2,
            special_request="Window seats if available.",
        )

        reservation.full_clean()
        reservation.save()

        self.assertEqual(Reservation.objects.count(), 1)

    def test_reservation_must_target_exactly_one_item(self):
        reservation = Reservation(
            user=self.user,
            hotel=self.hotel,
            transport=self.transport,
            reservation_type=Reservation.ReservationType.HOTEL,
            check_in_date=date(2026, 5, 1),
            check_out_date=date(2026, 5, 5),
            guests_count=2,
            rooms_reserved=1,
        )

        with self.assertRaises(ValidationError):
            reservation.full_clean()


class ReservationApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="api-user@example.com",
            password="TravelPass123!",
            first_name="API",
            last_name="User",
            phone="+212600000200",
            is_email_verified=True,
        )
        self.other_user = User.objects.create_user(
            email="other-user@example.com",
            password="TravelPass123!",
            first_name="Other",
            last_name="User",
            phone="+212600000201",
            is_email_verified=True,
        )
        self.hotel = Hotel.objects.create(
            name="Skyline Grand",
            city="Dubai",
            address="Downtown Dubai",
            description="Luxury city stay",
            price_per_night=295,
            rating=4.9,
            number_of_rooms=80,
            available_rooms=20,
            image="https://example.com/skyline.jpg",
        )
        self.transport = Transport.objects.create(
            type=Transport.TransportType.FLIGHT,
            company="BlueSky Airways",
            departure_city="Rabat",
            arrival_city="Dubai",
            departure_time=timezone.now() + timedelta(days=3),
            arrival_time=timezone.now() + timedelta(days=3, hours=7),
            price=520,
            available_seats=16,
            total_seats=120,
            service_class=Transport.ServiceClass.BUSINESS,
            notes="Long-haul business route",
        )
        self.list_url = reverse("reservation-list-create")

    def test_authentication_is_required(self):
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_hotel_reservation_for_authenticated_user(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {
                "reservation_type": Reservation.ReservationType.HOTEL,
                "hotel": self.hotel.id,
                "check_in_date": "2026-06-01",
                "check_out_date": "2026-06-05",
                "guests_count": 2,
                "rooms_reserved": 1,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        reservation = Reservation.objects.get()
        self.assertEqual(reservation.user, self.user)
        self.assertEqual(response.data["reservation_type"], Reservation.ReservationType.HOTEL)
        self.assertEqual(response.data["hotel"]["id"], self.hotel.id)

    def test_create_transport_reservation_for_authenticated_user(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {
                "reservation_type": Reservation.ReservationType.TRANSPORT,
                "transport": self.transport.id,
                "passengers_count": 2,
                "special_request": "Window seats if possible",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        reservation = Reservation.objects.get()
        self.assertEqual(reservation.user, self.user)
        self.assertEqual(response.data["transport"]["id"], self.transport.id)

    def test_list_returns_only_current_users_reservations(self):
        Reservation.objects.create(
            user=self.user,
            hotel=self.hotel,
            reservation_type=Reservation.ReservationType.HOTEL,
            check_in_date=date(2026, 6, 1),
            check_out_date=date(2026, 6, 5),
            guests_count=2,
            rooms_reserved=1,
        )
        Reservation.objects.create(
            user=self.other_user,
            transport=self.transport,
            reservation_type=Reservation.ReservationType.TRANSPORT,
            passengers_count=1,
        )

        self.client.force_authenticate(self.user)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["reservation_type"], Reservation.ReservationType.HOTEL)

    def test_detail_is_limited_to_current_users_reservation(self):
        own_reservation = Reservation.objects.create(
            user=self.user,
            hotel=self.hotel,
            reservation_type=Reservation.ReservationType.HOTEL,
            check_in_date=date(2026, 7, 1),
            check_out_date=date(2026, 7, 3),
            guests_count=2,
            rooms_reserved=1,
        )
        other_reservation = Reservation.objects.create(
            user=self.other_user,
            transport=self.transport,
            reservation_type=Reservation.ReservationType.TRANSPORT,
            passengers_count=2,
        )

        self.client.force_authenticate(self.user)

        own_response = self.client.get(
            reverse("reservation-detail", kwargs={"pk": own_reservation.pk})
        )
        other_response = self.client.get(
            reverse("reservation-detail", kwargs={"pk": other_reservation.pk})
        )

        self.assertEqual(own_response.status_code, status.HTTP_200_OK)
        self.assertEqual(other_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_reservation_rejects_invalid_payload(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {
                "reservation_type": Reservation.ReservationType.HOTEL,
                "hotel": self.hotel.id,
                "check_in_date": "2026-06-05",
                "check_out_date": "2026-06-01",
                "guests_count": 2,
                "rooms_reserved": 1,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("check_out_date", response.data)

    def test_user_can_cancel_own_reservation(self):
        reservation = Reservation.objects.create(
            user=self.user,
            hotel=self.hotel,
            reservation_type=Reservation.ReservationType.HOTEL,
            check_in_date=date(2026, 7, 10),
            check_out_date=date(2026, 7, 14),
            guests_count=2,
            rooms_reserved=1,
        )

        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("reservation-cancel", kwargs={"pk": reservation.pk}),
            format="json",
        )

        reservation.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Reservation.Status.CANCELLED)
        self.assertEqual(reservation.status, Reservation.Status.CANCELLED)

    def test_cannot_cancel_other_users_reservation(self):
        reservation = Reservation.objects.create(
            user=self.other_user,
            transport=self.transport,
            reservation_type=Reservation.ReservationType.TRANSPORT,
            passengers_count=1,
        )

        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("reservation-cancel", kwargs={"pk": reservation.pk}),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_cancel_already_cancelled_reservation(self):
        reservation = Reservation.objects.create(
            user=self.user,
            transport=self.transport,
            reservation_type=Reservation.ReservationType.TRANSPORT,
            passengers_count=2,
            status=Reservation.Status.CANCELLED,
        )

        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("reservation-cancel", kwargs={"pk": reservation.pk}),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)

    def test_hotel_checkout_must_be_after_checkin(self):
        reservation = Reservation(
            user=self.user,
            hotel=self.hotel,
            reservation_type=Reservation.ReservationType.HOTEL,
            check_in_date=date(2026, 5, 5),
            check_out_date=date(2026, 5, 1),
            guests_count=2,
            rooms_reserved=1,
        )

        with self.assertRaises(ValidationError):
            reservation.full_clean()


class AdminReservationApiTests(APITestCase):
    def setUp(self):
        self.url = reverse("admin-reservation-list")
        self.admin_user = User.objects.create_user(
            email="admin-reservations@example.com",
            password="TravelPass123!",
            first_name="Admin",
            last_name="Reservations",
            phone="+212600000500",
            role=User.Role.ADMIN,
            is_email_verified=True,
        )
        self.regular_user = User.objects.create_user(
            email="user-reservations@example.com",
            password="TravelPass123!",
            first_name="Regular",
            last_name="Reservations",
            phone="+212600000501",
            is_email_verified=True,
        )
        self.other_user = User.objects.create_user(
            email="traveler@example.com",
            password="TravelPass123!",
            first_name="Atlas",
            last_name="Traveler",
            phone="+212600000502",
            is_email_verified=True,
        )
        self.hotel = Hotel.objects.create(
            name="Ocean View Suites",
            city="Agadir",
            address="Beachfront Avenue",
            description="Family beach stay",
            price_per_night=210,
            rating=4.7,
            number_of_rooms=36,
            available_rooms=10,
            image="https://example.com/ocean-view.jpg",
        )
        self.transport = Transport.objects.create(
            type=Transport.TransportType.FLIGHT,
            company="North Star Airlines",
            departure_city="Marrakech",
            arrival_city="Madrid",
            departure_time=timezone.now() + timedelta(days=5),
            arrival_time=timezone.now() + timedelta(days=5, hours=2),
            price=260,
            available_seats=40,
            total_seats=140,
            service_class=Transport.ServiceClass.ECONOMY,
            notes="Morning departure",
        )
        self.older_reservation = Reservation.objects.create(
            user=self.regular_user,
            hotel=self.hotel,
            reservation_type=Reservation.ReservationType.HOTEL,
            status=Reservation.Status.CONFIRMED,
            check_in_date=date(2026, 8, 2),
            check_out_date=date(2026, 8, 6),
            guests_count=2,
            rooms_reserved=1,
        )
        Reservation.objects.filter(pk=self.older_reservation.pk).update(
            reserved_at=timezone.now() - timedelta(days=1),
            updated_at=timezone.now() - timedelta(days=1),
        )
        self.older_reservation.refresh_from_db()
        self.newer_reservation = Reservation.objects.create(
            user=self.other_user,
            transport=self.transport,
            reservation_type=Reservation.ReservationType.TRANSPORT,
            status=Reservation.Status.PENDING,
            passengers_count=3,
            special_request="Seats together",
        )

    def test_admin_can_list_all_reservations_with_management_fields(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [reservation["id"] for reservation in response.data],
            [self.newer_reservation.id, self.older_reservation.id],
        )
        self.assertEqual(response.data[0]["user"]["email"], self.other_user.email)
        self.assertEqual(response.data[0]["user"]["name"], self.other_user.full_name)
        self.assertEqual(response.data[0]["type"], Reservation.ReservationType.TRANSPORT)
        self.assertEqual(
            response.data[0]["reserved_item_summary"],
            {
                "id": self.transport.id,
                "kind": Reservation.ReservationType.TRANSPORT,
                "title": self.transport.company,
                "subtitle": (
                    f"{self.transport.departure_city} -> {self.transport.arrival_city}"
                ),
            },
        )
        self.assertEqual(response.data[1]["hotel"]["name"], self.hotel.name)
        self.assertEqual(response.data[1]["check_in_date"], "2026-08-02")
        self.assertEqual(response.data[1]["rooms_reserved"], 1)

    def test_regular_user_is_denied(self):
        self.client.force_authenticate(self.regular_user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_is_denied(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
