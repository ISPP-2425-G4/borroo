from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, SearchItemsView, EnumChoicesView
from .serializers import ItemSerializer

router = DefaultRouter()
router.register(r'items', ItemViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path("api/enum-choices/", EnumChoicesView.as_view(), name="enum-choices"),
    path('search_item/', SearchItemsView.as_view(), name='search_item'),
]
