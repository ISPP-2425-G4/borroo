from django.db import models
from django.contrib.auth.models import User


class ItemCategory(models.TextChoices):
    ELECTRONICS = 'ELECTRONICS', 'Electronics'
    TOOLS = 'TOOLS', 'Tools'
    SPORTS_EQUIPMENT = 'SPORTS_EQUIPMENT', 'Sports Equipment'
    CAMPING_GEAR = 'CAMPING_GEAR', 'Camping Gear'
    HOME_APPLIANCES = 'HOME_APPLIANCES', 'Home Appliances'
    FURNITURE = 'FURNITURE', 'Furniture'
    PARTY_SUPPLIES = 'PARTY_SUPPLIES', 'Party Supplies'
    COSTUMES = 'COSTUMES', 'Costumes'
    PHOTOGRAPHY_EQUIPMENT = 'PHOTOGRAPHY_EQUIPMENT', 'Photography Equipment'
    AUDIOVISUAL_EQUIPMENT = 'AUDIOVISUAL_EQUIPMENT', 'Audiovisual Equipment'
    GARDENING_TOOLS = 'GARDENING_TOOLS', 'Gardening Tools'
    OFFICE_EQUIPMENT = 'OFFICE_EQUIPMENT', 'Office Equipment'
    CONSTRUCTION_EQUIPMENT = 'CONSTRUCTION_EQUIPMENT', 'Construction Equipment'
    TRAVEL_ACCESSORIES = 'TRAVEL_ACCESSORIES', 'Travel Accessories'
    MEDICAL_EQUIPMENT = 'MEDICAL_EQUIPMENT', 'Medical Equipment'
    GAMES_AND_CONSOLES = 'GAMES_AND_CONSOLES', 'Games and Consoles'


class CancelType(models.TextChoices):
    FLEXIBLE = 'FLEXIBLE', 'Flexible'
    MEDIUM = 'MEDIUM', 'Medium'
    STRICT = 'STRICT', 'Strict'


class Item(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    item_category = models.CharField(max_length=50,
                                     choices=ItemCategory.choices)
    cancel_type = models.CharField(max_length=10, choices=CancelType.choices)
    user = models.ForeignKey(User, on_delete=models.CASCADE,
                             related_name='items')

    def __str__(self):
        return self.title
