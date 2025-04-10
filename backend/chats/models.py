from django.db import models
from usuarios.models import User
from django.core.exceptions import ValidationError


class Chat(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE,
                              related_name='chats_user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE,
                              related_name='chats_user2')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')

    def clean(self):
        """Evitar duplicados y chats con uno mismo."""
        if self.user1 == self.user2:
            raise ValidationError("Un usuario no puede chatear consigo mismo.")
        # Ordena siempre igual para evitar duplicados
        if self.user1.id > self.user2.id:
            self.user1, self.user2 = self.user2, self.user1

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

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
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']
