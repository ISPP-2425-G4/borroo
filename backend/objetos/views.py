from rest_framework import viewsets
from .models import Item
from .serializers import ItemSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer


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
        if min_price:
            items = items.filter(price__gte=min_price)
        if max_price:
            items = items.filter(price__lte=max_price)

        results = list(items.values('id', 'title', 'category', 'price'))

        return Response({'results': results}, status=status.HTTP_200_OK)
