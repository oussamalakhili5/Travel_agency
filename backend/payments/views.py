from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from config.permissions import IsAdminUserRole

from .models import Payment
from .serializers import (
    AdminPaymentSerializer,
    PaymentActionSerializer,
    PaymentCreateSerializer,
    PaymentSerializer,
)
from .services import mark_payment_cancelled, mark_payment_failed, mark_payment_paid


class PaymentListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Payment.objects.filter(user=self.request.user)
            .select_related(
                "reservation",
                "reservation__hotel",
                "reservation__transport",
                "reservation__package",
            )
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PaymentCreateSerializer

        return PaymentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        output_serializer = PaymentSerializer(
            payment,
            context=self.get_serializer_context(),
        )

        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class PaymentDetailAPIView(generics.RetrieveAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).select_related(
            "reservation",
            "reservation__hotel",
            "reservation__transport",
            "reservation__package",
        )


class PaymentConfirmAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        payment = generics.get_object_or_404(
            Payment.objects.filter(user=request.user).select_related(
                "reservation",
                "reservation__hotel",
                "reservation__transport",
                "reservation__package",
            ),
            pk=pk,
        )
        payment = mark_payment_paid(payment)
        serializer = PaymentSerializer(payment, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class PaymentFailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        payment = generics.get_object_or_404(
            Payment.objects.filter(user=request.user).select_related(
                "reservation",
                "reservation__hotel",
                "reservation__transport",
                "reservation__package",
            ),
            pk=pk,
        )
        serializer = PaymentActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reason = serializer.validated_data.get("reason") or "Mock payment failed."
        payment = mark_payment_failed(payment, reason=reason)
        output_serializer = PaymentSerializer(payment, context={"request": request})
        return Response(output_serializer.data, status=status.HTTP_200_OK)


class PaymentCancelAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        payment = generics.get_object_or_404(
            Payment.objects.filter(user=request.user).select_related(
                "reservation",
                "reservation__hotel",
                "reservation__transport",
                "reservation__package",
            ),
            pk=pk,
        )
        payment = mark_payment_cancelled(payment)
        serializer = PaymentSerializer(payment, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminPaymentListAPIView(generics.ListAPIView):
    serializer_class = AdminPaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]
    queryset = Payment.objects.select_related(
        "user",
        "reservation",
        "reservation__hotel",
        "reservation__transport",
        "reservation__package",
    ).order_by("-created_at")
