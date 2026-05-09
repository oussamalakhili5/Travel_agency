from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "reference_id",
        "user",
        "reservation",
        "amount",
        "currency",
        "method",
        "status",
        "created_at",
    )
    list_filter = ("status", "method", "currency", "created_at")
    search_fields = ("reference_id", "transaction_id", "user__email")
    readonly_fields = ("reference_id", "created_at", "updated_at")
    autocomplete_fields = ("user", "reservation")
