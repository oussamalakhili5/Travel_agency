from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    AuthTokenObtainPairSerializer,
    RegisterSerializer,
    ResendVerificationCodeSerializer,
    UserSerializer,
    VerifyEmailSerializer,
)


REGISTRATION_SUCCESS_MESSAGE = (
    "Registration completed successfully. "
    "Please verify your email with the code we sent."
)
RESEND_SUCCESS_MESSAGE = (
    "If an account exists for this email and still requires verification, "
    "a new verification code has been sent."
)
EMAIL_DELIVERY_FAILED_DEBUG_MESSAGE = (
    "Verification code generated. Email delivery failed. "
    "Check backend logs in development."
)
EMAIL_DELIVERY_FAILED_PUBLIC_MESSAGE = (
    "Verification code generated, but the email could not be delivered. "
    "Please contact support or try again later."
)


def build_verification_message(default_message, delivery_result):
    if (
        settings.DEBUG
        and delivery_result is not None
        and delivery_result.debug_message
    ):
        return delivery_result.debug_message

    if (
        settings.DEBUG
        and delivery_result is not None
        and not delivery_result.delivered
    ):
        return EMAIL_DELIVERY_FAILED_DEBUG_MESSAGE

    return default_message


def build_email_delivery_payload(delivery_result):
    if delivery_result is None or delivery_result.delivered:
        return None

    payload = {
        "delivered": False,
        "message": EMAIL_DELIVERY_FAILED_PUBLIC_MESSAGE,
    }

    if settings.DEBUG and delivery_result.reason:
        payload["reason"] = delivery_result.reason

    return payload


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        delivery_result = getattr(serializer, "email_delivery_result", None)
        response_data = {
            "message": build_verification_message(
                REGISTRATION_SUCCESS_MESSAGE,
                delivery_result,
            ),
            "user": UserSerializer(user).data,
        }
        delivery_payload = build_email_delivery_payload(delivery_result)

        if delivery_payload is not None:
            response_data["email_delivery"] = delivery_payload

        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = AuthTokenObtainPairSerializer


class VerifyEmailView(generics.GenericAPIView):
    serializer_class = VerifyEmailSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                "message": "Email verified successfully.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class ResendVerificationCodeView(generics.GenericAPIView):
    serializer_class = ResendVerificationCodeSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        delivery_result = getattr(serializer, "email_delivery_result", None)
        response_data = {
            "message": build_verification_message(
                RESEND_SUCCESS_MESSAGE,
                delivery_result,
            )
        }
        delivery_payload = build_email_delivery_payload(delivery_result)

        if delivery_payload is not None:
            response_data["email_delivery"] = delivery_payload

        return Response(
            response_data,
            status=status.HTTP_200_OK,
        )


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
