from rest_framework import serializers

from .models import Package


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = (
            "id",
            "title",
            "description",
            "destination",
            "city",
            "price",
            "duration_days",
            "start_date",
            "end_date",
            "image_url",
        )
        read_only_fields = fields


class AdminPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = (
            "id",
            "title",
            "description",
            "destination",
            "city",
            "price",
            "duration_days",
            "start_date",
            "end_date",
            "image_url",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))

        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError(
                {"end_date": "End date must be later than start date."}
            )

        return attrs


class AdminPackageListSerializer(AdminPackageSerializer):
    class Meta(AdminPackageSerializer.Meta):
        read_only_fields = AdminPackageSerializer.Meta.fields
