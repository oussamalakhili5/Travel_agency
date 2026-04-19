from rest_framework import serializers

from .models import Hotel


class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = (
            "id",
            "name",
            "city",
            "address",
            "description",
            "price_per_night",
            "rating",
            "available_rooms",
            "image",
        )
        read_only_fields = fields


class AdminHotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = (
            "id",
            "name",
            "city",
            "address",
            "description",
            "price_per_night",
            "rating",
            "available_rooms",
            "number_of_rooms",
            "image",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, attrs):
        number_of_rooms = attrs.get(
            "number_of_rooms",
            getattr(self.instance, "number_of_rooms", None),
        )
        available_rooms = attrs.get(
            "available_rooms",
            getattr(self.instance, "available_rooms", None),
        )

        if (
            number_of_rooms is not None
            and available_rooms is not None
            and available_rooms > number_of_rooms
        ):
            raise serializers.ValidationError(
                {
                    "available_rooms": (
                        "Available rooms cannot exceed the total number of rooms."
                    )
                }
            )

        return attrs


class AdminHotelListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = (
            "id",
            "name",
            "description",
            "city",
            "address",
            "price_per_night",
            "rating",
            "available_rooms",
            "number_of_rooms",
            "image",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
