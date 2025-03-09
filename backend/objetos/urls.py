from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, SearchItemsView, EnumChoicesView

router = DefaultRouter()
router.register(r'full', ItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("enum-choices/", EnumChoicesView.as_view(), name="enum-choices"),
    path('search_item/', SearchItemsView.as_view(), name='search_item'),
]
