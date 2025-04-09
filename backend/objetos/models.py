from decimal import Decimal
from django.db import models

from django.core.validators import MinValueValidator
from django.core.validators import MaxValueValidator, DecimalValidator
from django.core.exceptions import ValidationError
from django.db.models import F


class ItemCategory(models.TextChoices):
    TECHNOLOGY = ('technology', 'Tecnología')
    SPORTS = ('sports', 'Deporte')
    DIY = ('diy', 'Bricolaje')
    CLOTHING = ('clothing', 'Ropa')
    FURNITURE_AND_LOGISTICS = ('furniture_and_logistics',
                               'Mobiliario y logística')
    ENTERTAINMENT = ('entertainment', 'Entretenimiento')


class ItemSubcategory(models.TextChoices):
    # TECHNOLOGY
    COMPUTERS = ('computers', 'Ordenadores')
    COMPUTER_ACCESSORIES = ('computer_accessories', 'Accesorios de ordenador')
    SMARTPHONES = ('smartphones', 'Smartphones')
    TABLETS = ('tablets', 'Tablets')
    CAMERAS = ('cameras', 'Cámaras')
    CONSOLES = ('consoles', 'Consolas')
    TV = ('tv', 'Televisores')
    MONITORS = ('monitors', 'Monitores')
    SMARTHOME = ('smarthome', 'Hogar inteligente')
    AUDIO = ('audio', 'Audio')
    SMARTWATCHES = ('smartwatchs', 'Smartwatches')
    PRINTERS_SCANNERS = ('printers_scanners', 'Impresoras y escáneres')
    DRONES = ('drones', 'Drones')
    PROJECTORS = ('projectors', 'Proyectores')
    TECHNOLOGY__OTHERS = ('technology_others', 'Otros (Tecnología)')

    # SPORTS
    CYCLING = ('cycling', 'Ciclismo')
    GYM = ('gym', 'Gimnasio')
    CALISTHENICS = ('calisthenics', 'Calistenia')
    RUNNING = ('running', 'Running')
    BALL_SPORTS = ('ball_sports', 'Deportes de pelota')
    RACKET_SPORTS = ('racket_sports', 'Deportes de raqueta')
    PADDLE_SPORTS = ('paddle_sports', 'Deportes de remo')
    MARTIAL_ARTS = ('martial_arts', 'Artes marciales')
    SNOW_SPORTS = ('snow_sports', 'Deportes de nieve')
    SKATEBOARDING = ('skateboarding', 'Skate')
    BEACH_SPORTS = ('beach_sports', 'Deportes de playa')
    POOL_SPORTS = ('pool_sports', 'Deportes de piscina')
    RIVER_SPORTS = ('river_sports', 'Deportes de río')
    MOUNTAIN_SPORTS = ('mountain_sports', 'Deportes de montaña')
    EXTREME_SPORTS = ('extreme_sports', 'Deportes extremos')
    SPORTS_OTHERS = ('sports_others', 'Otros (Deporte)')

    # DIY
    ELECTRIC_TOOLS = ('electric_tools', 'Herramientas eléctricas')
    MANUAL_TOOLS = ('manual_tools', 'Herramientas manuales')
    MACHINES = ('machines', 'Máquinas')
    ELECTRICITY = ('electricity', 'Electricidad')
    PLUMBING = ('plumbing', 'Fontanería')
    WOODWORKING = ('woodworking', 'Carpintería')
    PAINTING = ('painting', 'Pintura')
    GARDENING = ('gardening', 'Jardinería')
    DECORATION = ('decoration', 'Decoración')
    DIY_OTHERS = ('diy_others', 'Otros  (Bricolaje)')

    # CLOTHING
    SUMMER_CLOTHING = ('summer_clothing', 'Ropa de verano')
    WINTER_CLOTHING = ('winter_clothing', 'Ropa de invierno')
    MEVENT_CLOTHING = ('mevent_clothing', 'Ropa de evento para hombre')
    WEVENT_CLOTHING = ('wevent_clothing', 'Ropa de evento para mujer')
    SPORT_EVENT_APPAREL = ('sport_event_apparel', 'Ropa de evento deportivo')
    MSHOES = ('mshoes', 'Zapatos para hombre')
    WSHOES = ('wshoes', 'Zapatos para mujer')
    SUITS = ('suits', 'Trajes')
    DRESSES = ('dresses', 'Vestidos')
    JEWELRY = ('jewelry', 'Joyería')
    WATCHES = ('watches', 'Relojes')
    BAGS = ('bags', 'Bolsos')
    SUNGLASSES = ('sunglasses', 'Gafas de sol')
    HATS = ('hats', 'Sombreros')
    CLOTHING_OTHERS = ('clothing_others', 'Otros (Ropa)')

    # FURNITURE_AND_LOGISTICS
    HOME_FURNITURE = ('home_furniture', 'Muebles de hogar')
    HOME_APPLIANCES = ('home_appliances', 'Electrodomésticos')
    EVENT_EQUIPMENT = ('event_equipment', 'Equipamiento para eventos')
    KIDS_FURNITURE = ('kids_furniture', 'Muebles para niños')
    OFFICE_FURNITURE = ('office_furniture', 'Muebles de oficina')
    KITCHEN = ('kitchen', 'Cocina')
    BATHROOM = ('bathroom', 'Baño')
    GARDEN_FURNITURE = ('garden_furniture', 'Muebles de jardín')
    DECORATION_AMBIENCE = ('decoration_ambience', 'Decoración y ambiente')
    FURNITURE_AND_LOGISTICS_OTHERS = ('furniture_and_logistics_others',
                                      'Otros (Mobiliario y logística)')

    # ENTERTAINMENT
    VIDEOGAMES = ('videogames', 'Videojuegos')
    BOARD_GAMES = ('board_games', 'Juegos de mesa')
    BOOKS = ('books', 'Libros')
    MOVIES = ('movies', 'Películas')
    MUSIC = ('music', 'Música')
    INSTRUMENTS = ('instruments', 'Instrumentos')
    PARTY = ('party', 'Fiesta')
    CAMPING = ('camping', 'Camping')
    TRAVEL = ('travel', 'Viaje')
    OTHER_ENTERTAINMENT = ('other_entertainment', 'Otros (Entretenimiento)')

    # NONE
    NONE = ('none', 'Ninguno')


class CancelType(models.TextChoices):
    FLEXIBLE = ('flexible', 'Flexible')
    MEDIUM = ('medium', 'Medio')
    STRICT = ('strict', 'Estricto')


class PriceCategory(models.TextChoices):
    HOUR = ('hour', 'Hora')
    DAY = ('day', 'Día')
    MONTH = ('month', 'Mes')


class Item(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(max_length=1000)
    category = models.CharField(
        max_length=50,
        choices=ItemCategory.choices
    )
    subcategory = models.CharField(
         max_length=50,
         choices=ItemSubcategory.choices,
         default=ItemSubcategory.NONE
     )
    cancel_type = models.CharField(
        max_length=10,
        choices=CancelType.choices
    )
    price_category = models.CharField(
        max_length=10,
        choices=PriceCategory.choices
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[
            MinValueValidator(0.01, message="El precio debe ser mayor a 0."),
            MaxValueValidator(99999999.99,
                              message="El precio no puede ser \
                                  mayor a 99,999,999.99."),
            DecimalValidator(max_digits=10, decimal_places=2)
        ])
    deposit = models.DecimalField(max_digits=10, decimal_places=2, validators=[
            MinValueValidator(0.01, message="El precio debe ser mayor a 0."),
            MaxValueValidator(99999999.99,
                              message="El precio no puede ser \
                                  mayor a 99,999,999.99."),
            DecimalValidator(max_digits=10, decimal_places=2)
        ])
    user = models.ForeignKey('usuarios.User', related_name='items',
                             on_delete=models.CASCADE)
    draft_mode = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    num_likes = models.IntegerField(default=0)

    def publish(self):
        if (
            self.user.pricing_plan == "free"
            and (
                Item.objects.filter(user=self.user, draft_mode=False)
                .count()
                >= 10
            )
        ):
            raise ValidationError(
                "No puedes tener más de 10 ítems publicados con el plan Free."
            )

        self.draft_mode = False
        self.save()

    def like(self, user):
        liked, created = LikedItem.objects.get_or_create(user=user, item=self)
        if created:
            Item.objects.filter(id=self.id).update(
                            num_likes=F('num_likes') + 1)
        return created

    def dislike(self, user):
        deleted, _ = LikedItem.objects.filter(user=user, item=self).delete()
        if deleted:
            Item.objects.filter(id=self.id).update(
                            num_likes=F('num_likes') - 1)
        return bool(deleted)


class LikedItem(models.Model):
    id = models.AutoField(primary_key=True)
    item = models.ForeignKey(
        Item, related_name='liked_items', on_delete=models.CASCADE)
    user = models.ForeignKey(
        'usuarios.User', related_name='liked_items', on_delete=models.CASCADE)


class UnavailablePeriod(models.Model):
    item = models.ForeignKey(
        Item, related_name='unavailable_periods', on_delete=models.CASCADE)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    class Meta:
        unique_together = ('item', 'start_date', 'end_date')


class ItemImage(models.Model):
    item = models.ForeignKey(Item, related_name='images',
                             on_delete=models.CASCADE)
    image = models.URLField()


class ItemRequest(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(max_length=1000)
    category = models.CharField(
        max_length=50,
        choices=ItemCategory.choices
    )
    subcategory = models.CharField(
        max_length=50,
        choices=ItemSubcategory.choices
    )
    cancel_type = models.CharField(
        max_length=10,
        choices=CancelType.choices
    )
    price_category = models.CharField(
        max_length=10,
        choices=PriceCategory.choices
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[
        MinValueValidator(Decimal("0.01"),
                          message="El precio debe ser mayor a 0."),
        MaxValueValidator(Decimal("99999999.99"),
                          message="El precio no puede ser mayor"
                          " a 99,999,999.99."),
        DecimalValidator(max_digits=10, decimal_places=2)
    ])
    user = models.ForeignKey(
        'usuarios.User',
        related_name='item_requests',
        on_delete=models.CASCADE
        )
    created_at = models.DateTimeField(auto_now_add=True)
    approved = models.BooleanField(default=False)
    deposit = models.DecimalField(max_digits=10, decimal_places=2, validators=[
            MinValueValidator(Decimal("0.01"),
                              message="El precio debe ser mayor a 0."),
            MaxValueValidator(Decimal("99999999.99"),
                              message="El precio no puede ser \
                                  mayor a 99,999,999.99."),
            DecimalValidator(max_digits=10, decimal_places=2)
        ])

    def approve(self):
        """Método para aprobar la solicitud y crear un Item"""
        item = Item.objects.create(
            title=self.title,
            description=self.description,
            category=self.category,
            subcategory=self.subcategory,
            cancel_type=self.cancel_type,
            price_category=self.price_category,
            price=self.price,
            deposit=self.deposit,
            user=self.user,
            draft_mode=True
        )
        self.approved = True
        self.save()
        return item
