from django.urls import path
from . import views

urlpatterns = [
    path('', views.AdvertisementListView.as_view(), name='advertisement-list'),
    path('public/', views.PublicAdvertisementListView.as_view(), name='public-advertisement-list'),
    path('stats/', views.AdvertisementStatsView.as_view(), name='advertisement-stats'),
    path('position/<str:position>/', views.get_advertisements_by_position, name='advertisements-by-position'),
    path('<int:ad_id>/view/', views.track_ad_view, name='track-ad-view'),
    path('<int:ad_id>/click/', views.track_ad_click, name='track-ad-click'),
    path('<int:ad_id>/analytics/', views.advertisement_analytics, name='advertisement-analytics'),
    path('<int:pk>/', views.AdvertisementDetailView.as_view(), name='advertisement-detail'),
]
