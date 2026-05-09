from django.urls import path

from .views import (
    PaymentCancelAPIView,
    PaymentConfirmAPIView,
    PaymentDetailAPIView,
    PaymentFailAPIView,
    PaymentListCreateAPIView,
)


urlpatterns = [
    path("", PaymentListCreateAPIView.as_view(), name="payment-list-create"),
    path("<int:pk>/", PaymentDetailAPIView.as_view(), name="payment-detail"),
    path("<int:pk>/confirm/", PaymentConfirmAPIView.as_view(), name="payment-confirm"),
    path("<int:pk>/fail/", PaymentFailAPIView.as_view(), name="payment-fail"),
    path("<int:pk>/cancel/", PaymentCancelAPIView.as_view(), name="payment-cancel"),
]
