from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.admin_dashboard, name='admin-dashboard'),
    path('users/', views.user_management, name='admin-user-management'),
    path('items/', views.item_management, name='admin-item-management'),
    path('orders/', views.order_management, name='admin-order-management'),
    path('bulk-action/', views.bulk_action, name='admin-bulk-action'),
    path('system-health/', views.system_health, name='admin-system-health'),
]
