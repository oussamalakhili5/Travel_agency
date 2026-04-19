from rest_framework import serializers


class ChatbotRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=500, allow_blank=False, trim_whitespace=True)
