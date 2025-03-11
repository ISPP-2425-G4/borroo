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
        data["password"] = make_password(data["password"])

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": serializer.data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def login(self, request):
        """Login de usuario y generación de token JWT"""
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Se requiere usuario y contraseña"},
                            status=status.HTTP_400_BAD_REQUEST)

        # Verificar si el usuario existe
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"},
                            status=status.HTTP_404_NOT_FOUND)

        # Comprobar si la contraseña es correcta
        if not check_password(password, user.password):
            return Response({"error": "Credencialesssss incorrectas"},
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
