from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CurrentUserView,
    LoginView,
    RegisterView,
    ResendVerificationCodeView,
    VerifyEmailView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("verify-email/", VerifyEmailView.as_view(), name="auth-verify-email"),
    path(
        "resend-verification-code/",
        ResendVerificationCodeView.as_view(),
        name="auth-resend-verification-code",
    ),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", CurrentUserView.as_view(), name="auth-me"),
]
