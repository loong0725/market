from django.urls import path
from . import views

urlpatterns = [
    path('', views.AddressListView.as_view(), name='address-list'),
    path('<int:pk>/', views.AddressDetailView.as_view(), name='address-detail'),
    path('<int:address_id>/set-default/', views.set_default_address, name='set-default-address'),
    path('default/', views.get_default_address, name='get-default-address'),
]
