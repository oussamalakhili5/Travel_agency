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
