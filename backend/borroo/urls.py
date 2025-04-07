"""
URL configuration for borroo project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static


def api_home(request):
    data = {
        "message": "Bienvenido a la API de Borroo",
        "endpoints": {
            "usuarios": "/usuarios/",
            "objetos": "/objetos/",
            "rentas": "/rentas/",
            "pagos": "/pagos/",
            "chats": "/chats/",
        }
    }
    return JsonResponse(data)


urlpatterns = [
    path("", api_home),
    path("usuarios/", include("usuarios.urls")),
    path('objetos/', include('objetos.urls')),
    path('rentas/', include('rentas.urls')),
    path('pagos/', include('pagos.urls')),
    path('chats/', include('chats.urls')),
    path('admin/', admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
