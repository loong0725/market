from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WantedItemViewSet

router = DefaultRouter()
router.register(r'wanted', WantedItemViewSet, basename='wanted')

urlpatterns = [
    path('', include(router.urls)),
]

