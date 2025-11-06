from django.urls import path
from . import views_web

urlpatterns = [
    path('', views_web.admin_login_view, name='admin_login'),
    path('dashboard/', views_web.admin_dashboard, name='admin_dashboard'),
    path('users/', views_web.admin_users, name='admin_users'),
    path('users/<int:user_id>/action/', views_web.admin_users_action, name='admin_users_action'),
    path('items/', views_web.admin_items, name='admin_items'),
    path('items/<int:item_id>/action/', views_web.admin_items_action, name='admin_items_action'),
    path('orders/', views_web.admin_orders, name='admin_orders'),
    path('memberships/', views_web.admin_memberships, name='admin_memberships'),
]



