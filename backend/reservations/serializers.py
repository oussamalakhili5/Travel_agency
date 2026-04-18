from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from hotels.models import Hotel
from transports.models import Transport

from .models import Reservation


class ReservationHotelSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ("id", "name", "city", "address", "image", "price_per_night")
        read_only_fields = fields


class ReservationTransportSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Transport
        fields = (
            "id",
            "type",
            "company",
            "departure_city",
            "arrival_city",
            "departure_time",
            "arrival_time",
            "price",
            "service_class",
        )
        read_only_fields = fields


class ReservationOutputSerializer(serializers.ModelSerializer):
    hotel = ReservationHotelSummarySerializer(read_only=True)
    transport = ReservationTransportSummarySerializer(read_only=True)

    class Meta:
        model = Reservation
        fields = (
            "id",
            "reservation_type",
            "status",
            "reserved_at",
            "updated_at",
            "hotel",
            "transport",
            "check_in_date",
            "check_out_date",
            "guests_count",
            "rooms_reserved",
            "passengers_count",
            "special_request",
        )
        read_only_fields = fields


class ReservationCreateSerializer(serializers.ModelSerializer):
    hotel = serializers.PrimaryKeyRelatedField(
        queryset=Hotel.objects.filter(is_active=True),
        required=False,
        allow_null=True,
    )
    transport = serializers.PrimaryKeyRelatedField(
        queryset=Transport.objects.filter(is_active=True),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Reservation
        fields = (
            "reservation_type",
            "hotel",
            "transport",
            "check_in_date",
            "check_out_date",
            "guests_count",
            "rooms_reserved",
            "passengers_count",
            "special_request",
        )

    def validate(self, attrs):
        user = self.context["request"].user
        reservation = Reservation(user=user, **attrs)

        try:
            reservation.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict) from exc

        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        return Reservation.objects.create(user=user, **validated_data)
