from django.db import models

class ItemCategory(enumerate.Enum):
    ELECTRONICS = 'Electronics'
    TOOLS = 'Tools'
    SPORTS_EQUIPMENT = 'Sports Equipment'
    CAMPING_GEAR = 'Camping Gear'
    HOME_APPLIANCES = 'Home Appliances'
    FURNITURE = 'Furniture'
    PARTY_SUPPLIES = 'Party Supplies'
    COSTUMES = 'Costumes'
    PHOTOGRAPHY_EQUIPMENT = 'Photography Equipment'
    AUDIOVISUAL_EQUIPMENT = 'Audiovisual Equipment'
    GARDENING_TOOLS = 'Gardening Tools'
    OFFICE_EQUIPMENT = 'Office Equipment'
    CONSTRUCTION_EQUIPMENT = 'Construction Equipment'
    TRAVEL_ACCESSORIES = 'Travel Accessories'
    MEDICAL_EQUIPMENT = 'Medical Equipment'
    GAMES_AND_CONSOLES = 'Games and Consoles'

class CancelType(enumerate.Enum):
    flexible = 'Flexible'
    medium = 'Medium'
    strict = 'Strict'

class Item(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    item_category = models.CharField(max_length=10, choices=ItemCategory.choices)
    cancel_type = models.CharField(max_length=10, choices=CancelType.choices)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items')

    def __str__(self):
        return self.title
    