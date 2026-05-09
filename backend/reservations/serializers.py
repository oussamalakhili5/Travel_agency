from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from hotels.models import Hotel
from packages.models import Package
from transports.models import Transport

from .models import Reservation


User = get_user_model()


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


class ReservationPackageSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = (
            "id",
            "title",
            "destination",
            "city",
            "price",
            "duration_days",
            "start_date",
            "end_date",
            "image_url",
        )
        read_only_fields = fields


class ReservationOutputSerializer(serializers.ModelSerializer):
    hotel = ReservationHotelSummarySerializer(read_only=True)
    transport = ReservationTransportSummarySerializer(read_only=True)
    package = ReservationPackageSummarySerializer(read_only=True)

    class Meta:
        model = Reservation
        fields = (
            "id",
            "reservation_type",
            "status",
            "payment_status",
            "reserved_at",
            "updated_at",
            "hotel",
            "transport",
            "package",
            "check_in_date",
            "check_out_date",
            "guests_count",
            "rooms_reserved",
            "passengers_count",
            "special_request",
        )
        read_only_fields = fields


class AdminReservationUserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="full_name", read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "name")
        read_only_fields = fields


class AdminReservationSerializer(ReservationOutputSerializer):
    user = AdminReservationUserSerializer(read_only=True)
    type = serializers.CharField(source="reservation_type", read_only=True)
    reserved_item_summary = serializers.SerializerMethodField()

    class Meta(ReservationOutputSerializer.Meta):
        fields = (
            "id",
            "user",
            "type",
            "reservation_type",
            "status",
            "payment_status",
            "reserved_item_summary",
            "reserved_at",
            "updated_at",
            "hotel",
            "transport",
            "package",
            "check_in_date",
            "check_out_date",
            "guests_count",
            "rooms_reserved",
            "passengers_count",
            "special_request",
        )
        read_only_fields = fields

    def get_reserved_item_summary(self, obj):
        if obj.hotel:
            return {
                "id": obj.hotel_id,
                "kind": obj.reservation_type,
                "title": obj.hotel.name,
                "subtitle": obj.hotel.city,
            }

        if obj.transport:
            return {
                "id": obj.transport_id,
                "kind": obj.reservation_type,
                "title": obj.transport.company,
                "subtitle": (
                    f"{obj.transport.departure_city} -> {obj.transport.arrival_city}"
                ),
            }

        if obj.package:
            return {
                "id": obj.package_id,
                "kind": obj.reservation_type,
                "title": obj.package.title,
                "subtitle": obj.package.destination,
            }

        return None


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
    package = serializers.PrimaryKeyRelatedField(
        queryset=Package.objects.filter(is_active=True),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Reservation
        fields = (
            "reservation_type",
            "hotel",
            "transport",
            "package",
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
