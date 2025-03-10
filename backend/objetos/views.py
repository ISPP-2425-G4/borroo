from rest_framework import viewsets, permissions
from .models import Item
from .serializers import ItemSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ItemCategory, CancelType, PriceCategory


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


class SearchItemsView(APIView):
    def get(self, request, *args, **kwargs):
        title = request.GET.get('title', None)
        category = request.GET.get('category', None)
        min_price = request.GET.get('min_price', None)
        max_price = request.GET.get('max_price', None)

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