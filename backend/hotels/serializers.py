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
            "price_per_night",
            "rating",
            "available_rooms",
            "number_of_rooms",
            "is_active",
            "updated_at",
        )
        read_only_fields = fields
