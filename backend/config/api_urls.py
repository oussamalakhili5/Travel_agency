from django.urls import path

from .api_views import health_check


urlpatterns = [
    path("health/", health_check, name="health-check"),
]
