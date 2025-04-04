from django.db import models
from rentas.models import Rent
from usuarios.models import User


class Chat(models.Model):
    rent = models.OneToOneField(Rent, on_delete=models.CASCADE,
                                related_name="chat")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat for {self.rent.item}"


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
