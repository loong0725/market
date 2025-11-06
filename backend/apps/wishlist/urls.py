from django.urls import path
from . import views

urlpatterns = [
    path('', views.WishlistView.as_view(), name='wishlist-detail'),
    path('add/', views.add_to_wishlist, name='add-to-wishlist'),
    path('item/<int:item_id>/remove/', views.remove_from_wishlist, name='remove-from-wishlist'),
    path('want-to-buy/', views.WantToBuyListView.as_view(), name='want-to-buy-list'),
    path('want-to-buy/<int:pk>/', views.WantToBuyDetailView.as_view(), name='want-to-buy-detail'),
    path('want-to-buy/user/<int:user_id>/', views.UserWantToBuyListView.as_view(), name='user-want-to-buy-list'),
    path('want-to-buy/<int:want_to_buy_id>/fulfill/', views.mark_want_to_buy_fulfilled, name='mark-want-to-buy-fulfilled'),
]
