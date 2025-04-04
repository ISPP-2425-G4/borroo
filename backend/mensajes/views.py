from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer


class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(
            rent__renter=user
        ) | Chat.objects.filter(
            rent__item__user=user
        )

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        chat = self.get_object()
        sender = request.user
        content = request.data.get('content')

        if not content:
            return Response({"error": "El contenido no puede estar vacío"},
                            status=status.HTTP_400_BAD_REQUEST)

        if sender == chat.rent.renter:
            receiver = chat.rent.item.user
        elif sender == chat.rent.item.user:
            receiver = chat.rent.renter
        else:
            error = "No tienes permiso para enviar mensajes en este chat"
            return Response({"error": error},
                            status=status.HTTP_403_FORBIDDEN)

        message = Message.objects.create(
            chat=chat, sender=sender, receiver=receiver, content=content
        )
        return Response(MessageSerializer(message).data,
                        status=status.HTTP_201_CREATED)
