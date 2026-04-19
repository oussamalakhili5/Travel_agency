from rest_framework import serializers

from .models import Transport


class TransportSerializer(serializers.ModelSerializer):
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
            "duration",
            "price",
            "available_seats",
            "service_class",
            "notes",
        )
        read_only_fields = fields


class AdminTransportSerializer(serializers.ModelSerializer):
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
            "duration",
            "price",
            "available_seats",
            "total_seats",
            "service_class",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "duration", "created_at", "updated_at")

    def validate(self, attrs):
        departure_time = attrs.get(
            "departure_time",
            getattr(self.instance, "departure_time", None),
        )
        arrival_time = attrs.get(
            "arrival_time",
            getattr(self.instance, "arrival_time", None),
        )
        total_seats = attrs.get(
            "total_seats",
            getattr(self.instance, "total_seats", None),
        )
        available_seats = attrs.get(
            "available_seats",
            getattr(self.instance, "available_seats", None),
        )

        errors = {}

        if (
            departure_time is not None
            and arrival_time is not None
            and arrival_time <= departure_time
        ):
            errors["arrival_time"] = "Arrival time must be later than departure time."

        if (
            total_seats is not None
            and available_seats is not None
            and available_seats > total_seats
        ):
            errors["available_seats"] = "Available seats cannot exceed total seats."

        if errors:
            raise serializers.ValidationError(errors)

        return attrs


class AdminTransportListSerializer(serializers.ModelSerializer):
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
            "duration",
            "price",
            "available_seats",
            "total_seats",
            "service_class",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
