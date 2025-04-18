import re
from django.http import JsonResponse
import datetime
from django.contrib.auth.hashers import check_password, make_password

from rentas.models import Rent
from rentas.serializers import RentSerializer
from .models import Review, User, PricingPlan
from .serializers import ReviewSerializer, UserSerializer, RegisterSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes
import logging
import uuid
from django.utils.timezone import now, timedelta
from django.core.mail import send_mail
from rest_framework.views import APIView
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from rest_framework.generics import RetrieveAPIView
from rest_framework.exceptions import AuthenticationFailed
from objetos.models import Item
from objetos.serializers import ItemSerializer
from django.shortcuts import get_object_or_404
import os
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import user_passes_test
from rest_framework.permissions import BasePermission, IsAuthenticated
from usuarios.models import Report
from usuarios.serializers import ReportSerializer


def index(request):
    return JsonResponse({"message": "Hello from Django!"})


def get_message(request):
    now = datetime.datetime.now().strftime("%H:%M:%S")
    return JsonResponse({"message": f"Hola desde Django! Hora actual: {now}"})


logger = logging.getLogger(__name__)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        """Registro de usuario y generación de token JWT"""
        data = request.data.copy()
        serializer = RegisterSerializer(data=data)

        if serializer.is_valid():
            try:
                # Solo encriptamos la contraseña después de validar
                validated_data = serializer.validated_data
                validated_data['password'] = make_password(
                    validated_data['password']
                )
                user = serializer.save()

                # Generamos el token para verificar el email
                user.verify_token = str(uuid.uuid4())
                user.save()

                cif = serializer.validated_data.get("cif")
                if cif is not None:
                    user.is_verified = True
                    user.save()

                # Enviar correo de verificación
                frontend_base_url = os.getenv("RECOVER_PASSWORD")
                frontend_url = f"{frontend_base_url}verifyEmail"
                verify_link = f"{frontend_url}?token={user.verify_token}"
                send_mail(
                    "Verificación de correo",
                    (
                        f"Hola {user.name}, Haz clic en el siguiente enlace "
                        f"para verificar tu correo: {verify_link}"
                    ),
                    "no-reply@tuapp.com",
                    [user.email],
                    fail_silently=False,
                )

                return Response({
                    "user": UserSerializer(user).data,
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    "error": f"Error al crear el usuario: {str(e)}",
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "error": "Error en la validación de datos",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def login(self, request):
        """Login de usuario y generación de token JWT"""
        username_or_email = request.data.get("usernameOrEmail")
        password = request.data.get("password")

        if not username_or_email or not password:
            return Response({"error": "Se requiere usuario y contraseña"},
                            status=status.HTTP_400_BAD_REQUEST)

        # Verificar si el usuario existe
        user = User.objects.filter(username=username_or_email).first() or \
            User.objects.filter(email=username_or_email).first()
        if not user:
            return Response({"error": "Usuario no encontrado"},
                            status=status.HTTP_404_NOT_FOUND)

        # Comprobar si la contraseña es correcta
        if not check_password(password, user.password):
            return Response({"error": "Credenciales incorrectas"},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Comprobar si la contraseña es correcta
        if not user.verified_account:
            return Response(
                {
                    "error": (
                        "El usuario no ha verificado su cuenta, "
                        "revisa tu correo electrónico"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Aquí se actualiza la suscripción si hace falta
        user.update_subscription_status()

        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        # First check if user is authenticated at all
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Then check if user has permission to delete
        instance = self.get_object()
        if instance != request.user:
            return Response(
                {"error": "No tienes permiso para eliminar este usuario"},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        self.permission_classes = [IsAuthenticated]
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )

        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if instance != request.user:
            return Response(
                {"error": "No tienes permiso para modificar este usuario"},
                status=status.HTTP_403_FORBIDDEN
            )

        if serializer.is_valid():
            updated_user = serializer.save()

            # Si el CIF se ha actualizado, actualizamos también el is_verified
            if "cif" in serializer.validated_data:
                cif = serializer.validated_data["cif"]
                updated_user.is_verified = cif is not None
                updated_user.save()
            return Response(self.get_serializer(updated_user).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upgrade_to_premium(self, request, pk=None):
        user = self.get_object()

        if user != request.user:
            return Response(
                {'error':
                 'No puedes modificar el plan de otro usuario.'},
                status=status.HTTP_403_FORBIDDEN)

        if user.pricing_plan != PricingPlan.FREE:
            logger.warning(
                f"Intento de upgrade fallido: {user.username} ya es premium.")
            return Response(
                {
                    'error': (
                        'Solo los usuarios con plan free '
                        'pueden actualizar a premium.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            logger.info(f"Actualizando a premium: {user.username}")
            user.pricing_plan = PricingPlan.PREMIUM
            user.subscription_start_date = now()
            user.subscription_end_date = now() + timedelta(days=30)
            user.save()

            return Response({
                'message': 'Plan actualizado a Premium.',
                'subscription_start_date': user.subscription_start_date,
                'subscription_end_date': user.subscription_end_date
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Fallo al actualizar a premium: {str(e)}")
            return Response({'error': f'Error actualizando el plan: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["post"],
            permission_classes=[IsAuthenticated])
    def downgrade_to_free(self, request):
        """Cancela la renovación automática del plan Premium del usuario."""
        user = request.user

        if user.pricing_plan != PricingPlan.PREMIUM:
            return Response({"error": "No tienes un plan Premium activo."},
                            status=status.HTTP_400_BAD_REQUEST)

        user.is_subscription_active = False
        # Quitar destacados de sus objetos
        featured_items = Item.objects.filter(user=user, featured=True)
        featured_items.update(featured=False)
        user.save()
        return Response({
            "message":
            "Has cancelado la renovación automática de tu suscripción.",
            "subscription_end_date": user.subscription_end_date
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'],
            permission_classes=[IsAuthenticated])
    def get_saldo(self, request, pk=None):
        """Obtiene el saldo del usuario."""
        user = self.get_object()
        return Response({'saldo': user.saldo}, status=status.HTTP_200_OK)


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
                message='La contraseña debe contener al menos 8 caracteres,'
                'una mayúscula, un número y un carácter especial.'
            ),
            RegexValidator(
                regex=r'^(?=.*\d)',
                message='La contraseña debe contener al menos 8 caracteres,'
                'una mayúscula, un número y un carácter especial.'
            ),
            RegexValidator(
                regex=r'^(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?])',
                message='La contraseña debe contener al menos 8 caracteres,'
                'una mayúscula, un número y un carácter especial.'
            ),
            RegexValidator(
                regex=r'^.{8,}$',
                message='La contraseña debe contener al menos 8 caracteres,'
                'una mayúscula, un número y un carácter especial.'
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


class VerifyEmailView(APIView):
    """Vista para confirmar el cambio de contraseña."""

    def post(self, request, token):
        user = User.objects.filter(verify_token=token).first()

        if not user:
            return Response({"error": "Token inválido"},
                            status=status.HTTP_400_BAD_REQUEST)

        if user.verified_account is True:
            return Response({"error": "Usuario ya verificado"},
                            status=status.HTTP_400_BAD_REQUEST)

        user.verified_account = True
        user.save()

        return Response({"message": "Usuario Verificado correctamente"},
                        status=status.HTTP_200_OK)


class UserProfileView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):

        username = self.request.query_params.get('username', None)

        if not username:
            raise AuthenticationFailed("No se proporcionó un username.")

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise AuthenticationFailed("El usuario no existe.")

        user_items = Item.objects.filter(user=user)

        user_data = UserSerializer(user).data
        items_data = ItemSerializer(user_items, many=True).data

        return Response({
            "user": user_data,
            "objects": items_data
        })


class ReviewCreateView(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data

        reviewer = get_object_or_404(User,
                                     username=data.get("reviewer_username"))
        reviewed_user = get_object_or_404(
            User, username=data.get("reviewed_username"))

        if reviewer == reviewed_user:
            return Response({"error": "No puedes valorarte a ti mismo."},
                            status=status.HTTP_400_BAD_REQUEST)
        # Comprobar si el usuario ya dejó una reseña
        existing_review = Review.objects.filter(
            reviewer=reviewer, reviewed_user=reviewed_user).first()

        if existing_review:
            # Si la reseña existe, actualizarla
            existing_review.rating = data.get("rating", existing_review.rating)
            existing_review.comment = data.get("comment",
                                               existing_review.comment)
            existing_review.save()
            return Response({"message": "Reseña actualizada correctamente"},
                            status=status.HTTP_200_OK)
        else:
            # Si no existe, crear una nueva
            Review.objects.create(
                reviewer=reviewer,
                reviewed_user=reviewed_user,
                rating=data.get("rating"),
                comment=data.get("comment")
            )
            return Response({"message": "Reseña creada correctamente"},
                            status=status.HTTP_201_CREATED)


class ReviewListView(APIView):
    def get(self, request, *args, **kwargs):
        username = request.query_params.get("username", None)

        if not username:
            return Response({
                "error": "El parámetro 'username' es obligatorio"},
                status=status.HTTP_400_BAD_REQUEST)

        reviewed_user = get_object_or_404(User, username=username)
        reviews = Review.objects.filter(reviewed_user=reviewed_user)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ReviewDeleteView(APIView):
    def delete(self, request, *args, **kwargs):
        data = request.data
        reviewer = get_object_or_404(User,
                                     username=data.get("reviewer_username"))
        reviewed_user = get_object_or_404(
            User, username=data.get("reviewed_username"))

        review = Review.objects.filter(
            reviewer=reviewer, reviewed_user=reviewed_user).first()

        if not review:
            return Response({"error": "Reseña no encontrada"},
                            status=status.HTTP_404_NOT_FOUND)

        review.delete()
        return Response({"message": "Reseña eliminada correctamente"},
                        status=status.HTTP_200_OK)


def is_allowed_user(user):
    # Verifica que el nombre de usuario sea el del usuario autorizado
    return user.username == "User1"


class CreateSuperuserView(APIView):

    @method_decorator(user_passes_test(is_allowed_user))
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username or not email or not password:
            return Response({
                "error": "Por favor, ingresa todos los campos."
            }, status=status.HTTP_400_BAD_REQUEST)

        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return Response({
                "error": "Formato de correo electrónico no válido."
            }, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({
                "error": "El nombre de usuario ya existe."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=make_password(password)
            )
            user.is_superuser = True
            user.is_staff = True
            user.save()

            return Response({
                "message": f"Superusuario {username} creado con éxito."
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_admin


class UserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CreateUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def put(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        if request.user == user:
            return Response({"error": "No puedes eliminarte a ti mismo."},
                            status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        return Response({"message": "Usuario eliminado correctamente."},
                        status=status.HTTP_204_NO_CONTENT)


class CreateItemView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, *args, **kwargs):
        serializer = ItemSerializer(data=request.data, context={'request':
                                                                request})
        if serializer.is_valid():
            # item = serializer.save(user=request.user)
            item = serializer.save()
            return Response(ItemSerializer(item, context={'request': request})
                            .data,
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateItemView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def put(self, request, item_id, *args, **kwargs):
        item = get_object_or_404(Item, id=item_id)

        serializer = ItemSerializer(item, data=request.data,
                                    context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(ItemSerializer(item, context={'request': request})
                            .data,
                            status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteItemView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, item_id):
        try:
            item = Item.objects.get(id=item_id)

            # Verificar si el usuario es admin o dueño del ítem
            if not request.user.is_admin and item.user != request.user:
                return Response({
                    "error": "No tienes permisos para eliminar este ítem."
                }, status=status.HTTP_403_FORBIDDEN)

            item.delete()
            return Response({
                "message": "Ítem eliminado con éxito."
            }, status=status.HTTP_204_NO_CONTENT)
        except Item.DoesNotExist:
            return Response({
                "error": "El ítem no existe."
            }, status=status.HTTP_404_NOT_FOUND)


class UpdateRentView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def put(self, request, *args, **kwargs):
        try:
            rent = Rent.objects.get(id=kwargs['rent_id'])
            if not request.user.is_admin:
                return Response({
                    "error": "No tienes permisos para actualizar esta renta."
                }, status=status.HTTP_403_FORBIDDEN)

            data = request.data.copy()
            item_id = data.get("item")
            if item_id:
                try:
                    data["item"] = Item.objects.get(id=item_id)
                except Item.DoesNotExist:
                    return Response({"error": "El ítem  no existe."},
                                    status=404)
            serializer = RentSerializer(
                rent,
                data=data,
                partial=True,
                context={"item_instance": rent.item}
            )

            if serializer.is_valid():
                updated_rent = serializer.save()
                return Response(RentSerializer(updated_rent).data,
                                status=status.HTTP_200_OK)

            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

        except Rent.DoesNotExist:
            return Response({
                "error": "La renta no existe."
            }, status=status.HTTP_404_NOT_FOUND)


class DeleteRentView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, *args, **kwargs):
        try:
            rent = Rent.objects.get(id=kwargs['rent_id'])

            # Verificar si el usuario es admin o dueño de la renta
            if not request.user.is_admin:
                return Response({
                    "error": "No tienes permisos suficientes para eliminar"
                    "esta renta."
                }, status=status.HTTP_403_FORBIDDEN)

            rent.delete()
            return Response({
                "message": "Renta eliminada con éxito."
            }, status=status.HTTP_204_NO_CONTENT)
        except Rent.DoesNotExist:
            return Response({
                "error": "La renta no existe."
            }, status=status.HTTP_404_NOT_FOUND)


class ListItemsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        items = Item.objects.all()
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)


class RentListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        rents = Rent.objects.all()
        serializer = RentSerializer(rents, many=True)
        return Response(serializer.data)


class UpdateUserPerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        user = request.user  # usuario autenticado

        serializer = UserSerializer(
            user, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            try:
                serializer.save()
                print("Perfil actualizado correctamente")
                return Response({
                    "message": "Perfil actualizado correctamente",
                    "user": serializer.data
                }, status=status.HTTP_200_OK)
            except Exception as e:
                print(f"Error al actualizar perfil: {str(e)}")
                return Response({
                    "error": f"No se pudo actualizar el perfil: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            print("Errores de validación:", serializer.errors)
            return Response({
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        reporter = get_object_or_404(User,
                                     id=data.get("reporter"))

        reported_user = get_object_or_404(
            User, id=data.get("reported_user"))

        if reporter == reported_user:
            return Response({"error": "No puedes reportarte a ti mismo."},
                            status=status.HTTP_400_BAD_REQUEST)

        existing_report = Report.objects.filter(
            reporter=reporter, reported_user=reported_user).first()

        if existing_report:
            existing_report.description = data.get("description",
                                                   existing_report.description)
            existing_report.category = data.get("category",
                                                existing_report.category)
            existing_report.status = data.get("status",
                                              existing_report.status)
            existing_report.save()
            return Response({"message": "Reporte actualizado correctamente"},
                            status=status.HTTP_200_OK)
        else:
            Report.objects.create(
                reporter=reporter,
                reported_user=reported_user,
                description=data.get("description"),
                category=data.get("category"),
                status="Pendiente"
            )
            return Response({"message": "Reporte creado correctamente"},
                            status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        data = request.data
        report = get_object_or_404(Report, id=kwargs['pk'])

        user = get_object_or_404(User, id=data.get("userId"))
        if not user.is_admin:
            return Response({
                "error": "No tienes permisos suficientes"
                + " para actualizar el reporte."
            }, status=status.HTTP_403_FORBIDDEN)

        valid_statuses = ["Pendiente", "En revisión", "Resuelto"]
        new_status = data.get("status")
        if new_status not in valid_statuses:
            return Response({
                "error": f"El estado '{new_status}' no es válido."
                + "Los estados permitidos son: {', '.join(valid_statuses)}."
            }, status=status.HTTP_400_BAD_REQUEST)

        Report.objects.filter(id=report.id).update(
            description=report.description,
            category=report.category,
            status=new_status,
            created_at=report.created_at,
            reporter=report.reporter,
            reported_user=report.reported_user
        )

        return Response({"message": "Estado del reporte"
                         + "actualizado correctamente"},
                        status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        return Response({
            "error": "No se puede eliminar el reporte."
        }, status=status.HTTP_400_BAD_REQUEST)
