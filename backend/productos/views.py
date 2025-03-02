from django.shortcuts import render

# Create your views here.
from django.db.models import Q

from productos.models import Product


def index(request):
    return render(request, "productos/index.html") 


def search_products(query):
    return Product.objects.filter(
        Q(name__icontains=query) | Q(description__icontains=query) | Q(category__name__icontains=query)
    )
