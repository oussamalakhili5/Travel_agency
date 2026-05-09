from django.contrib import admin

from .models import Package


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "destination",
        "city",
        "price",
        "duration_days",
        "is_active",
    )
    list_filter = ("is_active", "destination", "city")
    search_fields = ("title", "destination", "city")
