from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User

from .models import Package


class PackageApiTests(APITestCase):
    def setUp(self):
        self.list_url = reverse("package-list")
        self.package = Package.objects.create(
            title="Marrakech Culture Escape",
            description="Guided medina tours, boutique stay, and transfers.",
            destination="Marrakech",
            city="Marrakech",
            price=420,
            duration_days=4,
            image_url="https://example.com/marrakech.jpg",
        )
        self.inactive_package = Package.objects.create(
            title="Hidden Package",
            description="Inactive package.",
            destination="Paris",
            city="Paris",
            price=900,
            duration_days=3,
            is_active=False,
        )

    def test_public_package_list_returns_active_packages(self):
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], self.package.title)

    def test_public_package_filters_by_destination_and_max_price(self):
        Package.objects.create(
            title="Marrakech Luxury Week",
            description="Premium riad and guided day trips.",
            destination="Marrakech",
            city="Marrakech",
            price=1200,
            duration_days=7,
        )

        response = self.client.get(
            self.list_url,
            {"destination": "Marrakech", "max_price": "500"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([package["title"] for package in response.data], [self.package.title])

    def test_public_package_detail_hides_inactive_package(self):
        response = self.client.get(
            reverse("package-detail", kwargs={"pk": self.inactive_package.pk})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class AdminPackageApiTests(APITestCase):
    def setUp(self):
        self.url = reverse("admin-package-list")
        self.admin_user = User.objects.create_user(
            email="admin-packages@example.com",
            password="TravelPass123!",
            first_name="Admin",
            last_name="Packages",
            phone="+212600000700",
            role=User.Role.ADMIN,
            is_email_verified=True,
        )
        self.regular_user = User.objects.create_user(
            email="regular-packages@example.com",
            password="TravelPass123!",
            first_name="Regular",
            last_name="Packages",
            phone="+212600000701",
            is_email_verified=True,
        )

    def test_admin_can_create_package(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.post(
            self.url,
            {
                "title": "Dubai Premium Break",
                "description": "Hotel, city tour, and arrival transfer.",
                "destination": "Dubai",
                "city": "Dubai",
                "price": "890.00",
                "duration_days": 5,
                "image_url": "https://example.com/dubai.jpg",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Package.objects.count(), 1)

    def test_regular_user_cannot_access_admin_packages(self):
        self.client.force_authenticate(self.regular_user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
