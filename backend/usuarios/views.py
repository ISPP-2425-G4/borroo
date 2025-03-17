from django.http import JsonResponse
import datetime
from django.core.exceptions import PermissionDenied
from django.contrib.auth.hashers import check_password
from .models import User
from .serializers import UserSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action
from django.contrib.auth.hashers import make_password


def index(request):
    return JsonResponse({"message": "Hello from Django!"})


def get_message(request):
    now = datetime.datetime.now().strftime("%H:%M:%S")
    return JsonResponse({"message": f"Hola desde Django! Hora actual: {now}"})


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        """Registro de usuario y generación de token JWT"""
        data = request.data.copy()

        # Validar el serializer primero
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            # Si la contraseña es válida, aplicamos el hash
            data["password"] = make_password(data["password"])

            # Guardamos el usuario con la contraseña encriptada
            user = serializer.save()

            # Generamos los tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": serializer.data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)

        return Response({
            "error": "Error en la validación de datos",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def login(self, request):
        """Login de usuario y generación de token JWT"""
        username = request.data.get("username").strip()
        password = request.data.get("password").strip()

        if not username or not password:
            return Response({"error": "Se requiere usuario y contraseña"},
                            status=status.HTTP_400_BAD_REQUEST)

        # Verificar usuario correcto y contraseña correcta
        user = User.objects.filter(username=username).first()

        if not user or not check_password(password, user.password):
            return Response({"error": "Credenciales incorrectas"},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        if (
            user.username != request.user.username
            and not request.user.is_superuser
        ):
            raise PermissionDenied(
                "No tienes permiso para eliminar este usuario")

        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user = self.get_object()

        if (
            user.username != request.user.username
            and not request.user.is_superuser
        ):
            raise PermissionDenied(
                "No tienes permiso para modificar este usuario")

        return super().update(request, *args, **kwargs)
