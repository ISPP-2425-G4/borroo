from rest_framework import viewsets, permissions
from .models import Item, ItemImage, ItemRequest
from .serializers import ItemRequestSerializer, ItemSerializer
from .serializers import ItemImageSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ItemCategory, CancelType, PriceCategory
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied


class EnumChoicesView(APIView):
    def get(self, request, *args, **kwargs):
        categories = [
            {"value": choice.value, "label": choice.label}
            for choice in ItemCategory
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

    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """
        Permite a un usuario premium destacar o quitar destacado de su objeto,
        respetando el límite de 2 destacados.
        """
        item = self.get_object()
        user = item.user

        # Solo el dueño puede modificar su destacado
        if user != request.user:
            raise PermissionDenied(
                "No puedes modificar destacados de otro usuario."
            )

        # Validación del plan premium
        if user.pricing_plan != 'premium':
            return Response(
                {
                    'error': 'Solo los usuarios Premium pueden destacar '
                             'objetos.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Alternar destacado
        if not item.is_featured:
            featured_count = Item.objects.filter(
                user=user, is_featured=True
            ).exclude(id=item.id).count()
            if featured_count >= 2:
                return Response(
                    {'error': 'Solo puedes tener hasta 2 objetos destacados.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.is_featured = True
        else:
            item.is_featured = False

        item.save()
        return Response(
            {
                'message': 'El estado de destacado se actualizó '
                           'correctamente.',
                'is_featured': item.is_featured
            },
            status=status.HTTP_200_OK
        )


class ItemImageViewSet(viewsets.ModelViewSet):
    queryset = ItemImage.objects.all()
    serializer_class = ItemImageSerializer
    permission_classes = [permissions.AllowAny]


class SearchItemsView(APIView):
    def get(self, request, *args, **kwargs):
        title = request.GET.get('title', None)
        category = request.GET.get('category', None)

        items = Item.objects.all()

        if title:
            items = items.filter(title__icontains=title)
        if category:
            items = items.filter(category=category)

        results = list(items.values('id', 'title', 'category', 'price'))

        return Response({'results': results}, status=status.HTTP_200_OK)


class FilterByCategory(APIView):
    def get(self, request, *args, **kwargs):

        category = request.GET.get('category', None)

        items = Item.objects.all()

        if category:
            items = items.filter(category=category)

        results = list(items.values('id', 'title', 'category', 'price'))

        return Response({'results': results}, status=status.HTTP_200_OK)


class FilterByPrice(APIView):
    def get(self, request, *args, **kwargs):
        min_price = request.GET.get('min_price', None)
        max_price = request.GET.get('max_price', None)

        items = Item.objects.all()
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
