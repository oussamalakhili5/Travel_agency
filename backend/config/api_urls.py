from django.urls import include, path

from hotels.views import AdminHotelListAPIView
from reservations.views import AdminReservationListAPIView
from transports.views import AdminTransportListAPIView

from .api_views import health_check


urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("admin/hotels/", AdminHotelListAPIView.as_view(), name="admin-hotel-list"),
    path(
        "admin/transports/",
        AdminTransportListAPIView.as_view(),
        name="admin-transport-list",
    ),
    path(
        "admin/reservations/",
        AdminReservationListAPIView.as_view(),
        name="admin-reservation-list",
    ),
    path("auth/", include("users.urls")),
    path("hotels/", include("hotels.urls")),
    path("reservations/", include("reservations.urls")),
    path("transports/", include("transports.urls")),
]
