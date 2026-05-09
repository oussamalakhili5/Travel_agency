from rest_framework import serializers

from reservations.models import Reservation
from reservations.serializers import ReservationOutputSerializer

from .models import Payment
from .services import create_mock_payment_for_reservation


class PaymentSerializer(serializers.ModelSerializer):
    reservation = ReservationOutputSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = (
            "id",
            "reservation",
            "amount",
            "currency",
            "method",
            "status",
            "reference_id",
            "transaction_id",
            "provider",
            "failure_reason",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class PaymentCreateSerializer(serializers.Serializer):
    reservation = serializers.PrimaryKeyRelatedField(queryset=Reservation.objects.none())
    method = serializers.ChoiceField(
        choices=Payment.Method.choices,
        default=Payment.Method.MOCK_CARD,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")

        if request and request.user and request.user.is_authenticated:
            self.fields["reservation"].queryset = Reservation.objects.filter(
                user=request.user
            ).select_related("hotel", "transport", "package")

    def validate_reservation(self, reservation):
        if reservation.status == Reservation.Status.CANCELLED:
            raise serializers.ValidationError(
                "Cancelled reservations cannot be paid."
            )

        if reservation.payment_status == Reservation.PaymentStatus.PAID:
            raise serializers.ValidationError(
                "This reservation has already been paid."
            )

        return reservation

    def create(self, validated_data):
        request = self.context["request"]
        return create_mock_payment_for_reservation(
            user=request.user,
            reservation=validated_data["reservation"],
            method=validated_data["method"],
        )


class PaymentActionSerializer(serializers.Serializer):
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
    )


class AdminPaymentSerializer(PaymentSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    reservation_id = serializers.IntegerField(source="reservation.id", read_only=True)

    class Meta(PaymentSerializer.Meta):
        fields = PaymentSerializer.Meta.fields + (
            "user_email",
            "reservation_id",
        )
        read_only_fields = fields
