from django.urls import path
from . import views

urlpatterns = [
    path('items/', views.ItemSearchView.as_view(), name='item-search'),
    path('want-to-buy/', views.WantToBuySearchView.as_view(), name='want-to-buy-search'),
    path('suggestions/', views.search_suggestions, name='search-suggestions'),
    path('stats/', views.search_stats, name='search-stats'),
]
