from django.contrib import admin

from .models import Hotel


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "city",
        "price_per_night",
        "rating",
        "available_rooms",
        "number_of_rooms",
        "is_active",
        "updated_at",
    )
    list_filter = ("city", "is_active")
    search_fields = ("name", "city", "address", "description")
    readonly_fields = ("created_at", "updated_at")
    list_editable = ("is_active",)
    ordering = ("city", "name")
