from django.urls import path

from .views import TransportDetailAPIView, TransportListAPIView


urlpatterns = [
    path("", TransportListAPIView.as_view(), name="transport-list"),
    path("<int:pk>/", TransportDetailAPIView.as_view(), name="transport-detail"),
]
