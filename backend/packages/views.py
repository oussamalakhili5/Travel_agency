from decimal import Decimal, InvalidOperation

from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError

from config.permissions import IsAdminUserRole

from .models import Package
from .serializers import (
    AdminPackageListSerializer,
    AdminPackageSerializer,
    PackageSerializer,
)


class PackageListAPIView(generics.ListAPIView):
    serializer_class = PackageSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Package.objects.filter(is_active=True).order_by(
            "destination",
            "title",
        )
        destination = self.request.query_params.get("destination")
        city = self.request.query_params.get("city")
        max_price = self.request.query_params.get("max_price")

        if destination:
            queryset = queryset.filter(destination__iexact=destination.strip())

        if city:
            queryset = queryset.filter(city__iexact=city.strip())

        if max_price:
            try:
                max_price_value = Decimal(max_price)
            except (InvalidOperation, TypeError):
                raise ValidationError({"max_price": "max_price must be a valid number."})

            queryset = queryset.filter(price__lte=max_price_value)

        return queryset


class PackageDetailAPIView(generics.RetrieveAPIView):
    serializer_class = PackageSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Package.objects.filter(is_active=True)


class AdminPackageListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]
    queryset = Package.objects.all().order_by("-updated_at", "title")

    def get_serializer_class(self):
        if self.request.method == "GET":
            return AdminPackageListSerializer

        return AdminPackageSerializer


class AdminPackageDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminPackageSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]
    queryset = Package.objects.all()
