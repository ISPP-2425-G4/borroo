from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemRequestApprovalViewSet, ItemRequestView, ItemViewSet
from .views import FilterByCategory, FilterByPrice, SearchItemsView
from .views import ItemImageViewSet, EnumChoicesView, PublishItemView
from .views import ListDraftItemsView, ListUserItemsView
from .views import ListPublishedItemsView
from .views import ListItemRequestsView
from .views import ListLikedItems
from .views import ToggleLike
from .views import LikeStatus

router = DefaultRouter()
router.register(r'full', ItemViewSet)
router.register(r'item-images', ItemImageViewSet)
router.register(r'approve_request', ItemRequestApprovalViewSet,
                basename='item-request-approve')

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
    path('create_item_request/', ItemRequestView.as_view(),
         name='create_item_request'),
    path('publish_item/', PublishItemView.as_view(), name='publish_item'),
    path('list_draft_items/<int:user_id>/', ListDraftItemsView.as_view(),
         name='list_draft_items'),
    path('list_user_items/<int:user_id>/', ListUserItemsView.as_view(),
         name='list_user_items'),
    path('list_published_items/', ListPublishedItemsView.as_view(),
         name='list_published_items'),
    path('list_item_requests/', ListItemRequestsView.as_view(),
         name='list_item_requests'),
    path('list_liked_items', ListLikedItems.as_view(),
         name='list_liked_items'),
    path('like/<int:item_id>/', ToggleLike.as_view(),
         name='toggle_like'),
    path('like-status/<int:item_id>/',
         LikeStatus.as_view(), name='like-status'),

]
