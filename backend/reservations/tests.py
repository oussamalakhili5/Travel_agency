from datetime import date, timedelta

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

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
