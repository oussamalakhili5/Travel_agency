from django.urls import path

from .views import HotelDetailAPIView, HotelListAPIView


urlpatterns = [
    path("", HotelListAPIView.as_view(), name="hotel-list"),
    path("<int:pk>/", HotelDetailAPIView.as_view(), name="hotel-detail"),
]
