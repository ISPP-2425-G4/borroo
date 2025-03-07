from django.http import JsonResponse
import datetime
from rest_framework import viewsets, permissions
from .models import User
from .serializers import UserSerializer
from rest_framework import status
from django.contrib import messages
from django.shortcuts import render
from .forms import RegisterForm
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password
from django.contrib.auth import login


def index(request):
    return JsonResponse({"message": "Hello from Django!"})


def get_message(request):
    now = datetime.datetime.now().strftime("%H:%M:%S")
    return JsonResponse({"message": f"Hola desde Django! Hora actual: {now}"})


@csrf_exempt
def inicio_sesion(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        try:
            # Intentar encontrar el usuario por nombre de usuario
            user = User.objects.get(username=username)
            # Verificar la contraseña
            # Nota: Asumiendo que las contraseñas están hasheadas con django.contrib.auth.hashers
            if check_password(password, user.password):
                # Crear una sesión simple para hacer seguimiento del usuario conectado
                request.session['user_id'] = user.id
                # Devolver respuesta JSON con datos del usuario
                return JsonResponse({
                    "message": f"¡Bienvenido, {user.username}!",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "name": user.name,
                        "surname": user.surname,
                        "email": user.email,
                        "is_verified": user.is_verified,
                        "pricing_plan": user.pricing_plan
                    }
                })
            else:
                return JsonResponse({
                    "error": "Contraseña incorrecta"
                }, status=status.HTTP_401_UNAUTHORIZED)

        except User.DoesNotExist:
            return JsonResponse({
                "error": "El usuario no existe"
            }, status=status.HTTP_404_NOT_FOUND)

    # Si no es una solicitud POST
    return JsonResponse({
        "error": "Método no permitido"
    }, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@csrf_exempt
def registro(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.save()
            messages.success(request,
                             "¡Registro exitoso! Ahora puedes iniciar sesión.")
            return JsonResponse({"message": "User registered successfully!"},
                                status=status.HTTP_201_CREATED)
        else:
            messages.error(request,
                           "Por favor corrige los errores en el formulario.")
            return JsonResponse(form.errors,
                                status=status.HTTP_400_BAD_REQUEST)
    else:
        form = RegisterForm()

    return render(request, 'register.html', {'form': form})


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
