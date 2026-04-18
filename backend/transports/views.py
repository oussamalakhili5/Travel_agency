from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError

from .models import Transport
from .serializers import TransportSerializer


class TransportListAPIView(generics.ListAPIView):
    serializer_class = TransportSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Transport.objects.filter(is_active=True).order_by(
            "departure_time", "company"
        )
        departure_city = self.request.query_params.get("departure_city")
        arrival_city = self.request.query_params.get("arrival_city")
        transport_type = self.request.query_params.get("type")

        if departure_city:
            queryset = queryset.filter(departure_city__iexact=departure_city.strip())

        if arrival_city:
            queryset = queryset.filter(arrival_city__iexact=arrival_city.strip())

        if transport_type:
            valid_types = {choice for choice, _ in Transport.TransportType.choices}
            normalized_type = transport_type.strip().lower()

            if normalized_type not in valid_types:
                raise ValidationError(
                    {
                        "type": (
                            "type must be one of: "
                            f"{', '.join(sorted(valid_types))}."
                        )
                    }
                )

            queryset = queryset.filter(type=normalized_type)

        return queryset


class TransportDetailAPIView(generics.RetrieveAPIView):
    serializer_class = TransportSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Transport.objects.filter(is_active=True)
