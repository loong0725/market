from rest_framework import viewsets, permissions
from .models import WantedItem
from .serializers import WantedItemSerializer

class WantedItemViewSet(viewsets.ModelViewSet):
    queryset = WantedItem.objects.filter(is_active=True)
    serializer_class = WantedItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = WantedItem.objects.filter(is_active=True)
        user_id = self.request.query_params.get('user', None)
        if user_id is not None:
            queryset = queryset.filter(user_id=user_id)
        elif self.request.query_params.get('my', None) == 'true' and self.request.user.is_authenticated:
            queryset = queryset.filter(user=self.request.user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

