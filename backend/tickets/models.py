from django.db import models
from rentas.models import Rent, User
# Create your models here.


class TicketStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    IN_PROGRESS = "in_progress", "In Progress"
    RESOLVED = "resolved", "Resolved"
    CANCELLED = "cancelled", "Cancelled"


class Ticket(models.Model):
    rent = models.ForeignKey(Rent, on_delete=models.CASCADE,
                             related_name="tickets")
    reporter = models.ForeignKey(User, on_delete=models.CASCADE,
                                 related_name="reported_incidents")
    manager = models.ForeignKey(User, on_delete=models.CASCADE,
                                related_name="managed_tickets", null=True,
                                blank=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=TicketStatus.choices,
        default=TicketStatus.PENDING
    )


class TicketImage(models.Model):
    ticket = models.ForeignKey(Ticket, related_name='images',
                               on_delete=models.CASCADE)
    image = models.URLField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
