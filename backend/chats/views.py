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

    def create(self, request, *args, **kwargs):
        chat_creator = request.user
        other_user_id = request.data.get("otherUserId")  # ID del otro usuario

        # Validar que `other_user` está en la petición
        if not other_user_id:
            return Response(
                {"error": "Debes proporcionar un usuario para el chat"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validar que `other_user` existe en la base de datos
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "El usuario especificado no existe"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Evitar chats duplicados
        existing_chat = Chat.objects.filter(
            (Q(user1=chat_creator) & Q(user2=other_user)) |
            (Q(user1=other_user) & Q(user2=chat_creator))
        ).exists()

        if existing_chat:
            return Response(
                {"error": "Ya tienes un chat con este usuario"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Evitar que alguien cree un chat consigo mismo
        if chat_creator == other_user:
            return Response(
                {"error": "No puedes iniciar un chat contigo mismo"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Si pasa todas las validaciones, crear el chat
        chat = Chat.objects.create(user1=chat_creator, user2=other_user)
        return Response(ChatSerializer(chat).data,
                        status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def get_my_chats(self, request):
        user = request.user
        chats = Chat.objects.filter(Q(user1=user) | Q(user2=user)).distinct()
        serialized_chats = ChatSerializer(chats, many=True).data

        for chat in serialized_chats:
            other_user = (chat["user1"] if chat["user2"]
                          == user.id else chat["user2"])
            chat["otherUserName"] = User.objects.get(id=other_user).username

            # Obtener los mensajes del chat
            chat_instance = Chat.objects.get(id=chat["id"])
            last_message = chat_instance.messages.last()
            unread_count = chat_instance.messages.filter(
                receiver=user, is_read=False
            ).count()

            # Añadir los datos adicionales al chat
            chat["lastMessage"] = (
                last_message.content if last_message else None
            )
            chat["lastMessageTimestamp"] = (
                last_message.timestamp if last_message else None
            )
            chat["unreadCount"] = unread_count

        return Response(serialized_chats)

    @action(detail=True, methods=['get'], url_path='messages')
    def get_chat_messages(self, request, pk=None):
        """Obtiene los mensajes de un chat
        y marca como leídos los no leídos."""
        chat = self.get_object()
        user = request.user

        # Verificar que el usuario pertenece al chat
        if user != chat.user1 and user != chat.user2:
            return Response({"error": "No tienes acceso a este chat"},
                            status=status.HTTP_403_FORBIDDEN)

        # Obtener los mensajes del chat
        messages = chat.messages.all()

        # Filtrar los mensajes no leídos del usuario actual
        # y marcarlos como leídos
        unread_messages = messages.filter(receiver=user, is_read=False)
        unread_messages.update(is_read=True)

        return Response(MessageSerializer(messages, many=True).data)

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
