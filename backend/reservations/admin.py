from django.contrib import admin

from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "reservation_type",
        "related_item_name",
        "status",
        "payment_status",
        "party_size",
        "reserved_at",
    )
    list_filter = (
        "reservation_type",
        "status",
        "payment_status",
        "reserved_at",
        "updated_at",
    )
    search_fields = (
        "user__email",
        "hotel__name",
        "hotel__city",
        "transport__company",
        "transport__departure_city",
        "transport__arrival_city",
        "package__title",
        "package__destination",
        "package__city",
    )
    readonly_fields = ("reserved_at", "updated_at")
    autocomplete_fields = ("user", "hotel", "transport", "package")
    ordering = ("-reserved_at",)
    date_hierarchy = "reserved_at"

    @admin.display(description="Reserved item")
    def related_item_name(self, obj):
        item = obj.related_item
        return str(item) if item else "-"

    @admin.display(description="Party size")
    def party_size(self, obj):
        if obj.reservation_type == Reservation.ReservationType.HOTEL:
            return f"{obj.guests_count or 0} guest(s) / {obj.rooms_reserved or 0} room(s)"

        if obj.reservation_type == Reservation.ReservationType.TRANSPORT:
            return f"{obj.passengers_count or 0} passenger(s)"

        if obj.reservation_type == Reservation.ReservationType.PACKAGE:
            return f"{obj.guests_count or 0} traveler(s)"

        return "-"
