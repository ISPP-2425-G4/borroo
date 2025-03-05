from django.http import JsonResponse
import datetime
from rest_framework import viewsets, permissions
from .models import User
from .serializers import UserSerializer
from django.contrib.auth import authenticate, login
from django.contrib import messages
from rest_framework import status
from django.shortcuts import redirect, render
from .forms import RegisterForm


def index(request):
    return JsonResponse({"message": "Hello from Django!"})


def get_message(request):
    now = datetime.datetime.now().strftime("%H:%M:%S")
    return JsonResponse({"message": f"Hola desde Django! Hora actual: {now}"})


def inicio_sesion(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is None:
            try:
                usuario = User.objects.get(username=username)
                if not usuario.is_active:
                    messages.error(request,
                                   "Tu cuenta está inactiva. \
                                    No puedes iniciar sesión.")
                else:
                    messages.error(request, "Contraseña incorrecta.")
            except User.DoesNotExist:
                messages.error(request, "El usuario no existe.")
        else:
            login(request, user)
            messages.success(request, f"¡Bienvenido, {user.username}!")
            return redirect('index')

    return JsonResponse({"error": "Invalid credentials"},
                        status=status.HTTP_400_BAD_REQUEST)


def registro(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
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
