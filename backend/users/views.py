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


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                "message": build_verification_message(
                    REGISTRATION_SUCCESS_MESSAGE,
                    getattr(serializer, "email_delivery_result", None),
                ),
                "user": UserSerializer(user).data,
            },
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

        return Response(
            {
                "message": build_verification_message(
                    RESEND_SUCCESS_MESSAGE,
                    getattr(serializer, "email_delivery_result", None),
                )
            },
            status=status.HTTP_200_OK,
        )


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
