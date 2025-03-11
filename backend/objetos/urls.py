from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, SearchItemsView, EnumChoicesView
from .views import FilterByCategory, FilterByPrice
from .views import ItemImageViewSet

router = DefaultRouter()
router.register(r'full', ItemViewSet)
router.register(r'item-images', ItemImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("enum-choices/", EnumChoicesView.as_view(), name="enum-choices"),
    path('search_item/', SearchItemsView.as_view(), name='search_item'),
    path(
        'filter_by_category/',
        FilterByCategory.as_view(),
        name='cat_item'
    ),
    path(
        'filter_by_price/',
        FilterByPrice.as_view(),
        name='pri_item'
    ),
]
