from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Chat, Message, User
from django.db.models import Q
from .serializers import ChatSerializer, MessageSerializer


class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(user1=user) | Chat.objects.filter(
            user2=user)

    @action(detail=False, methods=['get'])
    def get_chats(self, request):
        user = request.user
        chats = Chat.objects.filter(Q(user1=user) | Q(user2=user)).distinct()
        serialized_chats = ChatSerializer(chats, many=True).data

        for chat in serialized_chats:
            other_user = (chat["user1"] if chat["user2"]
                          == user.id else chat["user2"])
            chat["otherUserName"] = User.objects.get(id=other_user).username

        return Response(serialized_chats)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        chat = self.get_object()
        sender = request.user
        content = request.data.get('content')

        if not content:
            return Response({"error": "El contenido no puede estar vacío"},
                            status=status.HTTP_400_BAD_REQUEST)

        if sender == chat.user1:
            receiver = chat.user2
        elif sender == chat.user2:
            receiver = chat.user1
        else:
            error = "No tienes permiso para enviar mensajes en este chat"
            return Response({"error": error},
                            status=status.HTTP_403_FORBIDDEN)

        message = Message.objects.create(
            chat=chat, sender=sender, receiver=receiver, content=content
        )

        return Response(MessageSerializer(message).data, status=status.
                        HTTP_201_CREATED)
