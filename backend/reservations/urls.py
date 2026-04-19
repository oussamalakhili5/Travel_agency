from django.urls import path

from .views import (
    ReservationCancelAPIView,
    ReservationDetailAPIView,
    ReservationListCreateAPIView,
)


urlpatterns = [
    path("", ReservationListCreateAPIView.as_view(), name="reservation-list-create"),
    path("<int:pk>/", ReservationDetailAPIView.as_view(), name="reservation-detail"),
    path("<int:pk>/cancel/", ReservationCancelAPIView.as_view(), name="reservation-cancel"),
]
