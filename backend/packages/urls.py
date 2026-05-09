from django.urls import path

from .views import PackageDetailAPIView, PackageListAPIView


urlpatterns = [
    path("", PackageListAPIView.as_view(), name="package-list"),
    path("<int:pk>/", PackageDetailAPIView.as_view(), name="package-detail"),
]
