from django.urls import path
from . import views

urlpatterns = [
    path('', views.CategoryListView.as_view(), name='category-list'),
    path('tree/', views.category_tree, name='category-tree'),
    path('<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('<int:category_id>/parameters/', views.CategoryParameterListView.as_view(), name='category-parameters'),
]
