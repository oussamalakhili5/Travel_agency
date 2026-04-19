from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .serializers import ChatbotRequestSerializer
from .services import build_response


class ChatbotAPIView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ChatbotRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = serializer.validated_data["message"]
        chatbot_response = build_response(message)

        return Response(
            {
                "message": message,
                **chatbot_response,
            },
            status=status.HTTP_200_OK,
        )
