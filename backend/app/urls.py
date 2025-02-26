from django.urls import path

from . import views  # Importa todo el módulo 'views'

app_name = "app"

urlpatterns = [
    path("", views.index, name="index"),
    path("api/message/", views.get_message, name="get_message"),  # Accede a las vistas con el prefijo 'views.'
]
