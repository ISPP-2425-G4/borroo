from django.db import models


class ItemCategory(models.TextChoices):
    DRILLS_AND_SCREWDRIVERS = 'drills_and_screwdrivers',
    'Taladros y destornilladores'
    ELECTRICITY_AND_ENERGY = 'electricity_and_energy', 'Electricidad y energía'
    SAWING_AND_CUTTING = 'sawing_and_cutting', 'Serrado y corte'
    MEASURING_INSTRUMENTS = 'measuring_instruments', 'Instrumentos de medición'
    VENTILATION = 'ventilation', 'Ventilación'
    HAND_TOOLS = 'hand_tools', 'Herramientas manuales'
    PAINT_AND_WALLPAPER = 'paint_and_wallpaper', 'Pintura y papel tapiz'
    OTHER_CONSTRUCTION_TOOLS = 'other_construction_tools',
    'Otros en construcción y herramientas'
    COMPRESSED_AIR = 'compressed_air', 'Aire comprimido'
    SOUND = 'sound', 'Sonido'
    DRONE = 'drone', 'Dron'
    PROJECTOR_AND_TV = 'projector_and_tv', 'Proyector y TV'
    VIDEO_GAMES = 'video_games', 'Videojuegos'
    COMPUTERS_AND_ACCESSORIES = 'computers_and_accessories',
    'Computadoras y accesorios'
    OTHER_ELECTRONICS = 'other_electronics', 'Otros en electrónica'
    MOBILE_PHONES_AND_TABLETS = 'mobile_phones_and_tablets',
    'Móviles y tabletas'
    RADIO = 'radio', 'Radio'
    OFFICE_MACHINERY = 'office_machinery', 'Maquinaria de oficina'
    PAYMENT_TERMINAL = 'payment_terminal', 'Terminal de pago'
    CAMERA_BATTERY = 'camera_battery', 'Batería de cámara'
    CAMERA_LENSES = 'camera_lenses', 'Lentes de cámara'
    CAMERAS = 'cameras', 'Cámaras'
    COLOR_SENSOR = 'color_sensor', 'Sensor de color'
    FLASH_AND_LIGHTS = 'flash_and_lights', 'Flash y luces'
    MEMORY_CARD = 'memory_card', 'Tarjeta de memoria'
    MONITOR = 'monitor', 'Monitor'
    PHOTO_BACKGROUND = 'photo_background', 'Fondo para fotografía'
    PHOTO_PRINTER = 'photo_printer', 'Impresora fotográfica'
    TELEPROMPTER = 'teleprompter', 'Teleprompter'
    UNDERWATER_CAMERA_BODIES = 'underwater_camera_bodies',
    'Cuerpos de cámara submarina'
    OTHER_CINEMA_PHOTOGRAPHY = 'other_cinema_photography',
    'Otros en cine y fotografía'
    GARDEN_FURNITURE = 'garden_furniture', 'Muebles de jardín'
    CABLE_LAYING_MACHINE = 'cable_laying_machine', 'Máquina tendecables'
    CHAINSAW = 'chainsaw', 'Motosierra'
    BRUSH_CUTTER = 'brush_cutter', 'Desbrozadora'
    GARDEN_ROLLER = 'garden_roller', 'Rodillo para jardín'
    LEAF_BLOWER = 'leaf_blower', 'Soplador de hojas'
    LAWN_MOWER = 'lawn_mower', 'Cortacésped'
    OTHER_GARDEN_MACHINERY = 'other_garden_machinery',
    'Otros en maquinaria de jardín'


class CancelType(models.TextChoices):
    FLEXIBLE = 'flexible', 'Flexible'
    MEDIUM = 'medium', 'Medium'
    STRICT = 'strict', 'Strict'


class PriceCategory(models.TextChoices):
    HOUR = 'hour', 'Hour'
    DAY = 'day', 'Day'
    WEEK = 'week', 'Week'
    MONTH = 'month', 'Month'
    YEAR = 'year', 'Year'


class Item(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=ItemCategory.choices
    )
    cancel_type = models.CharField(
        max_length=10,
        choices=CancelType.choices
    )
    price_category = models.CharField(
        max_length=10,
        choices=PriceCategory.choices
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.title
