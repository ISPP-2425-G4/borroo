from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions

from usuarios.models import User
from .models import Item, ItemImage, ItemRequest
from .serializers import ItemRequestSerializer, ItemSerializer
from .serializers import ItemImageSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ItemCategory, CancelType, PriceCategory, ItemSubcategory
from rest_framework.decorators import action
from django.core.exceptions import ValidationError


class EnumChoicesView(APIView):
    def get(self, request, *args, **kwargs):
        categories = [
            {"value": choice.value, "label": choice.label}
            for choice in ItemCategory
        ]

        subcategories = [
             {"value": choice.value, "label": choice.label}
             for choice in ItemSubcategory
         ]

        cancel_types = [
            {"value": choice.value, "label": choice.label}
            for choice in CancelType
        ]

        price_categories = [
            {"value": choice.value, "label": choice.label}
            for choice in PriceCategory
        ]

        return Response(
            {
                "categories": categories,
                "subcategories": subcategories,
                "cancel_types": cancel_types,
                "price_categories": price_categories,
            },
            status=status.HTTP_200_OK
        )


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        print("Request data:", request.data)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Validation errors:", serializer.errors)
        serializer.is_valid(raise_exception=True)
        print("Validated data:", serializer.validated_data)
        item = serializer.save()
        print("Created item:", item)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED,
                        headers=headers)

    @action(detail=False, methods=['post'])
    def toggle_feature(self, request):
        # Recibir desde el frontend
        item_id = request.data.get('item_id')
        user_id = request.data.get('user_id')

        # Validaciones básicas
        if not item_id or not user_id:
            return Response(
                {"error": "Faltan parámetros"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtener objetos
        item = get_object_or_404(Item, pk=item_id)
        user = get_object_or_404(User, pk=user_id)

        # Validación: ¿el user es el propietario?
        if item.user != user:
            return Response(
                {"error": "No puedes modificar un objeto que no es tuyo."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validación: ¿es premium?
        if user.pricing_plan != "premium":
            return Response(
                {
                    "error": "Solo los usuarios premium pueden destacar "
                             "objetos."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Si ya está destacado -> desmarcar
        if item.featured:
            item.featured = False
            item.save()
            return Response(
                {"message": "El objeto ya no es destacado."},
                status=status.HTTP_200_OK
            )

        # Comprobar cuántos destacados tiene el usuario
        featured_count = Item.objects.filter(user=user, featured=True).count()
        if featured_count >= 2:
            return Response(
                {"error": "Solo puedes tener 2 objetos destacados."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Marcar como destacado
        item.featured = True
        item.save()
        return Response(
            {"message": "El objeto ahora es destacado."},
            status=status.HTTP_200_OK
        )

    def get_queryset(self):
        queryset = super().get_queryset()
        featured = self.request.query_params.get('featured', None)
        if featured is not None and featured.lower() == 'true':
            queryset = queryset.filter(featured=True)

        return queryset


class ItemImageViewSet(viewsets.ModelViewSet):
    queryset = ItemImage.objects.all()
    serializer_class = ItemImageSerializer
    permission_classes = [permissions.AllowAny]


class SearchItemsView(APIView):
    def get(self, request, *args, **kwargs):
        title = request.GET.get('title', None)
        category = request.GET.get('category', None)

        items = Item.objects.filter(draft_mode=False)  # Filtrar publicados

        if title:
            items = items.filter(title__icontains=title)
        if category:
            items = items.filter(category=category)

        results = list(items.values('id', 'title', 'category', 'price'))

        return Response({'results': results}, status=status.HTTP_200_OK)


class FilterByCategory(APIView):
    def get(self, request, *args, **kwargs):

        category = request.GET.get('category', None)

        items = Item.objects.filter(draft_mode=False)  # Filtrar publicados

        if category:
            items = items.filter(category=category)

        results = list(items.values('id', 'title', 'category', 'price'))

        return Response({'results': results}, status=status.HTTP_200_OK)


class FilterByPrice(APIView):
    def get(self, request, *args, **kwargs):
        min_price = request.GET.get('min_price', None)
        max_price = request.GET.get('max_price', None)

        items = Item.objects.filter(draft_mode=False)  # Filtrar publicados
        if min_price:
            items = items.filter(price__gte=min_price)
        if max_price:
            items = items.filter(price__lte=max_price)

        results = list(items.values('id', 'title', 'category', 'price'))

        return Response({'results': results}, status=status.HTTP_200_OK)


class ItemRequestView(APIView):
    def post(self, request, *args, **kwargs):
        # Datos de la solicitud
        serializer = ItemRequestSerializer(data=request.data)

        if serializer.is_valid():
            item_request = serializer.save()
            return Response({
                'message': 'Solicitud de alquiler creada con éxito',
                'item_request': ItemRequestSerializer(item_request).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ItemRequestApprovalViewSet(viewsets.ViewSet):

    @action(detail=True, methods=['post'])
    def approve_request(self, request, pk=None):
        # Obtener la solicitud de alquiler por ID
        item_request = ItemRequest.objects.get(id=pk)

        # Asegurarnos de que no está aprobada
        if item_request.approved:
            return Response({'message': 'La solicitud ya ha sido aprobada'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Crear el nuevo objeto Item con los datos de la solicitud
        item = item_request.approve()

        # Serializar el objeto Item recién creado
        item_serializer = ItemSerializer(item)

        return Response(item_serializer.data, status=status.HTTP_201_CREATED)


class PublishItemView(APIView):
    def post(self, request, *args, **kwargs):
        item_id = request.data.get('item_id')
        user_id = request.data.get('user_id')
        user = get_object_or_404(User, id=user_id)
        try:
            item = Item.objects.get(id=item_id, user=user)
            item.publish()
            return Response(
                {"message": "Ítem publicado con éxito"},
                status=status.HTTP_200_OK,
            )

        except Item.DoesNotExist:
            return Response(
                {"error": "Ítem no encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ListDraftItemsView(APIView):
    def get(self, request, user_id, *args, **kwargs):
        user = get_object_or_404(User, id=user_id)
        items = Item.objects.filter(user=user, draft_mode=True)
        serializer = ItemSerializer(items, many=True)
        return Response({'results': serializer.data},
                        status=status.HTTP_200_OK)


class ListUserItemsView(APIView):
    def get(self, request, user_id, *args, **kwargs):
        user = get_object_or_404(User, id=user_id)
        items = Item.objects.filter(user=user)
        serializer = ItemSerializer(items, many=True)
        return Response({'results': serializer.data},
                        status=status.HTTP_200_OK)


class ListPublishedItemsView(APIView):
    def get(self, request, *args, **kwargs):
        items = Item.objects.filter(draft_mode=False)
        serializer = ItemSerializer(items, many=True)
        return Response({'results': serializer.data},
                        status=status.HTTP_200_OK)
