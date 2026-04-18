from django.urls import path

from .views import ReservationDetailAPIView, ReservationListCreateAPIView


urlpatterns = [
    path("", ReservationListCreateAPIView.as_view(), name="reservation-list-create"),
    path("<int:pk>/", ReservationDetailAPIView.as_view(), name="reservation-detail"),
]
