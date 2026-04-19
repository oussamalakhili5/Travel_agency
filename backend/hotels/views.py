from decimal import Decimal, InvalidOperation

from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError

from config.permissions import IsAdminUserRole

from .models import Hotel
from .serializers import AdminHotelListSerializer, AdminHotelSerializer, HotelSerializer


class HotelListAPIView(generics.ListAPIView):
    serializer_class = HotelSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Hotel.objects.filter(is_active=True).order_by("city", "name")
        city = self.request.query_params.get("city")
        max_price = self.request.query_params.get("max_price")

        if city:
            queryset = queryset.filter(city__iexact=city.strip())

        if max_price:
            try:
                max_price_value = Decimal(max_price)
            except (InvalidOperation, TypeError):
                raise ValidationError({"max_price": "max_price must be a valid number."})

            queryset = queryset.filter(price_per_night__lte=max_price_value)

        return queryset


class HotelDetailAPIView(generics.RetrieveAPIView):
    serializer_class = HotelSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Hotel.objects.filter(is_active=True)


class AdminHotelListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]
    queryset = Hotel.objects.all().order_by("-updated_at", "name")

    def get_serializer_class(self):
        if self.request.method == "GET":
            return AdminHotelListSerializer

        return AdminHotelSerializer


class AdminHotelDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminHotelSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]
    queryset = Hotel.objects.all()
