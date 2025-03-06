from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, SearchItemsView, EnumChoicesView

router = DefaultRouter()
router.register(r'items', ItemViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('search_item/', SearchItemsView.as_view(), name='search_item'),
    path('enum_views/', EnumChoicesView.as_view(), name='enum_views'),
]
