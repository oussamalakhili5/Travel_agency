from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response

from config.permissions import IsAdminUserRole

from .models import Reservation
from .serializers import (
    AdminReservationSerializer,
    ReservationCreateSerializer,
    ReservationOutputSerializer,
)


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


class ReservationCancelAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        reservation = generics.get_object_or_404(
            Reservation.objects.filter(user=request.user).select_related("hotel", "transport"),
            pk=pk,
        )

        try:
            reservation.cancel()
        except DjangoValidationError as exc:
            raise ValidationError(exc.message_dict) from exc

        serializer = ReservationOutputSerializer(reservation, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminReservationListAPIView(generics.ListAPIView):
    serializer_class = AdminReservationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]
    queryset = Reservation.objects.select_related("user", "hotel", "transport").order_by(
        "-reserved_at"
    )
