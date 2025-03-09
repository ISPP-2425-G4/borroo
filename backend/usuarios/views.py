from django.http import JsonResponse
import datetime
from rest_framework import viewsets, PermissionDenied
from .models import User
from .serializers import UserSerializer
from rest_framework import status
from django.shortcuts import render
from .forms import RegisterForm
from django.views.decorators.csrf import csrf_exempt


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
            # Attempt to find the user by username
            user = User.objects.get(username=username)

            from django.contrib.auth.hashers import check_password

            if check_password(password, user.password):
                # Create a simple session to track the logged-in user
                request.session['user_id'] = user.id
                request.session['username'] = user.username

                return JsonResponse({
                    "message": f"¡Bienvenido, {user.username}!",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "name": user.name,
                        "email": user.email
                    }
                })
            else:
                return JsonResponse({"error": "Contraseña incorrecta"},
                                    status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return JsonResponse({"error": "El usuario no existe"},
                                status=status.HTTP_400_BAD_REQUEST)

    return JsonResponse({"error": "Método no permitido"},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)


@csrf_exempt
def registro(request):
    if request.method == 'POST':
        data = request.POST

        # Create the form with the data
        form = RegisterForm(data)

        if form.is_valid():
            return JsonResponse({"message": "User registered successfully!"},
                                status=status.HTTP_201_CREATED)
        else:
            return JsonResponse(form.errors,
                                status=status.HTTP_400_BAD_REQUEST)
    else:
        form = RegisterForm()

    return render(request, 'register.html', {'form': form})


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        if user.username != request.user.username:
            raise PermissionDenied(
                "No tienes permiso para eliminar este usuario")

        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user = self.get_object()

        if user.username != request.user.username:
            raise PermissionDenied(
                "No tienes permiso para modificar este usuario")

        return super().update(request, *args, **kwargs)
