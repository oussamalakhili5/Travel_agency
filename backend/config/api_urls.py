from django.urls import include, path

from hotels.views import AdminHotelDetailAPIView, AdminHotelListCreateAPIView
from reservations.views import AdminReservationListAPIView
from transports.views import AdminTransportDetailAPIView, AdminTransportListCreateAPIView

from .api_views import health_check


urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("admin/hotels/", AdminHotelListCreateAPIView.as_view(), name="admin-hotel-list"),
    path(
        "admin/hotels/<int:pk>/",
        AdminHotelDetailAPIView.as_view(),
        name="admin-hotel-detail",
    ),
    path(
        "admin/transports/",
        AdminTransportListCreateAPIView.as_view(),
        name="admin-transport-list",
    ),
    path(
        "admin/transports/<int:pk>/",
        AdminTransportDetailAPIView.as_view(),
        name="admin-transport-detail",
    ),
    path(
        "admin/reservations/",
        AdminReservationListAPIView.as_view(),
        name="admin-reservation-list",
    ),
    path("auth/", include("users.urls")),
    path("chatbot/", include("chatbot.urls")),
    path("hotels/", include("hotels.urls")),
    path("reservations/", include("reservations.urls")),
    path("transports/", include("transports.urls")),
]
