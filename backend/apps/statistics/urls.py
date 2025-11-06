from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),
    path('user/', views.user_stats, name='user-stats'),
    path('sales/', views.sales_analytics, name='sales-analytics'),
    path('items/', views.item_analytics, name='item-analytics'),
]
