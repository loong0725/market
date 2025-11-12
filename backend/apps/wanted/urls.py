from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WantedItemViewSet, get_post_info

router = DefaultRouter()
router.register(r'wanted', WantedItemViewSet, basename='wanted')

urlpatterns = [
    path('wanted/post-info/', get_post_info, name='wanted-post-info'),
    path('', include(router.urls)),
]

