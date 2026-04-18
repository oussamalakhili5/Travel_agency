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
