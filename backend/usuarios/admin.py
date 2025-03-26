from django.contrib import admin

from rentas.models import Rent
from objetos.models import Item
from usuarios.models import User

admin.site.register(User)
admin.site.register(Item)
admin.site.register(Rent)
