from django.urls import include, path

from .api_views import health_check


urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("auth/", include("users.urls")),
]
