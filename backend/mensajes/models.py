from django.db import models
from usuarios.models import User


class Chat(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE,
                              related_name='chats_user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE,
                              related_name='chats_user2')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f"Chat entre {self.user1.username} y {self.user2.username}"


class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE,
                             related_name="messages")
    sender = models.ForeignKey(User,
                               on_delete=models.CASCADE,
                               related_name="sent_messages")
    receiver = models.ForeignKey(User,
                                 on_delete=models.CASCADE,
                                 related_name="received_messages")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']
