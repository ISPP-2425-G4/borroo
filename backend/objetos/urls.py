from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, SearchItemsView

router = DefaultRouter()
router.register(r'items', ItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('search_item/', SearchItemsView.as_view(), name='search_item'),
]
