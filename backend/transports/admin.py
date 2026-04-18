from django.contrib import admin

from .models import Transport


@admin.register(Transport)
class TransportAdmin(admin.ModelAdmin):
    list_display = (
        "company",
        "type",
        "departure_city",
        "arrival_city",
        "departure_time",
        "arrival_time",
        "service_class",
        "price",
        "available_seats",
        "is_active",
    )
    list_filter = (
        "type",
        "service_class",
        "departure_city",
        "arrival_city",
        "is_active",
    )
    search_fields = (
        "company",
        "departure_city",
        "arrival_city",
        "notes",
    )
    readonly_fields = ("duration", "created_at", "updated_at")
    list_editable = ("is_active",)
    ordering = ("departure_time", "company")
