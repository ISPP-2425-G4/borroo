from django.http import JsonResponse
import datetime
from django.contrib.auth.hashers import check_password, make_password
from .models import User, PricingPlan
from .serializers import UserSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes
import uuid
from django.utils.timezone import now
from django.core.mail import send_mail
from rest_framework.views import APIView
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import os


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

        # Encriptar la contraseña antes de validar el serializer
        data["password"] = make_password(data["password"])

        # Validar el serializer primero
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
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
            return Response({"error": "Credenciales incorrectas"},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_200_OK)

    # def destroy(self, request, *args, **kwargs):
    #     user = self.get_object()

    #     if (
    #         user.username != request.user.username
    #         and not request.user.is_superuser
    #     ):
    #         raise PermissionDenied(
    #             "No tienes permiso para eliminar este usuario")

    #     return super().destroy(request, *args, **kwargs)

    # def update(self, request, *args, **kwargs):
    #     user = self.get_object()

    #     if (
    #         user.username != request.user.username
    #         and not request.user.is_superuser
    #     ):
    #         raise PermissionDenied(
    #             "No tienes permiso para modificar este usuario")

    #     return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def upgrade_to_premium(self, request, pk=None):
        user = self.get_object()
        if user.pricing_plan != PricingPlan.FREE:
            return Response(
                {'error': 'Solo los usuarios con plan free pueden '
                 'actualizar a premium.'},
                status=status.HTTP_400_BAD_REQUEST)
        user.pricing_plan = PricingPlan.PREMIUM
        user.save()
        return Response(
            {'message': 'Plan actualizado a premium.'},
            status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def downgrade_to_free(self, request, pk=None):
        user = self.get_object()
        if user.pricing_plan != PricingPlan.PREMIUM:
            return Response(
                {'error': 'Solo los usuarios con plan premium'
                 'pueden cambiar a free.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.pricing_plan = PricingPlan.FREE
        user.save()
        return Response(
            {'message': 'Plan actualizado a free.'},
            status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_username(request):
    username = request.query_params.get('username')
    if User.objects.filter(username=username).exists():
        return JsonResponse({'exists': True})
    return JsonResponse({'exists': False})


@api_view(['GET'])
@permission_classes([AllowAny])
def check_email(request):
    email = request.query_params.get('email')
    if User.objects.filter(email=email).exists():
        return JsonResponse({'exists': True})
    return JsonResponse({'exists': False})

# Recuperacion de contraseña


class PasswordResetRequestView(APIView):
    """Vista para solicitar el restablecimiento de contraseña."""
    def post(self, request):
        email = request.data.get("email")
        user = User.objects.filter(email=email).first()

        if not user:
            return Response({
                "error": "No se encontró un usuario con ese email."},
                            status=status.HTTP_404_NOT_FOUND)

        # Generamos un token único
        user.reset_token = str(uuid.uuid4())
        user.reset_token_expiration = now()
        user.save()

        frontend_base_url = os.getenv("RECOVER_PASSWORD")
        frontend_url = f"{frontend_base_url}recoverPasswordNew"
        reset_link = f"{frontend_url}?token={user.reset_token}"

        send_mail(
            "Recuperación de contraseña",
            f"Haz clic en el siguiente enlace para restablecer tu contraseña: "
            f"{reset_link}",
            "no-reply@tuapp.com",
            [user.email],
            fail_silently=False,
        )

        return Response({"message": "Correo de recuperación enviado"},
                        status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """Vista para confirmar el cambio de contraseña."""
    def validate_password(self, password):
        """Aplica las validaciones de la contraseña definidas en el modelo."""
        validators = [
            RegexValidator(
                regex=r'^(?=.*[A-Z])',
                message='La contraseña debe contener'
                'al menos una letra mayúscula.'
            ),
            RegexValidator(
                regex=r'^(?=.*\d)',
                message='La contraseña debe contener al menos un número.'
            ),
            RegexValidator(
                regex=r'^(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?])',
                message='La contraseña debe contener'
                'al menos un carácter especial.'
            ),
            RegexValidator(
                regex=r'^.{8,}$',
                message='La contraseña debe tener al menos 8 caracteres.'
            ),
        ]

        # Ejecutar todas las validaciones
        for validator in validators:
            try:
                validator(password)
            except ValidationError as e:
                raise ValidationError(e.messages)

    def post(self, request, token):
        user = User.objects.filter(reset_token=token).first()

        if not user or not user.is_reset_token_valid():
            return Response({"error": "Token inválido o expirado"},
                            status=status.HTTP_400_BAD_REQUEST)

        new_password = request.data.get("password")
        if not new_password:
            return Response({
                "error": "Debes proporcionar una nueva contraseña"},
                            status=status.HTTP_400_BAD_REQUEST)

        # Validar la contraseña con las reglas del modelo
        try:
            self.validate_password(new_password)
        except ValidationError as e:
            return Response({"error": e.messages},
                            status=status.HTTP_400_BAD_REQUEST)

        # Guardamos la nueva contraseña encriptada
        user.password = make_password(new_password)
        user.reset_token = None  # Limpiamos el token después de usarlo
        user.reset_token_expiration = None
        user.save()

        return Response({"message": "Contraseña actualizada correctamente"},
                        status=status.HTTP_200_OK)
