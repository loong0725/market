from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListCreateView.as_view(), name='order-list-create'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('seller/', views.SellerOrderListView.as_view(), name='seller-orders'),
    path('<int:order_id>/status/', views.update_order_status, name='update-order-status'),
    path('<int:order_id>/cancel/', views.cancel_order, name='cancel-order'),
]
