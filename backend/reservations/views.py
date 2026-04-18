from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Reservation
from .serializers import ReservationCreateSerializer, ReservationOutputSerializer


class ReservationListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Reservation.objects.filter(user=self.request.user)
            .select_related("hotel", "transport")
            .order_by("-reserved_at")
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ReservationCreateSerializer

        return ReservationOutputSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reservation = serializer.save()
        output_serializer = ReservationOutputSerializer(
            reservation, context=self.get_serializer_context()
        )

        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class ReservationDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ReservationOutputSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user).select_related(
            "hotel", "transport"
        )
