from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Item
from .serializers import ItemSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Item.objects.all()
        # Filter by owner if owner parameter is provided
        owner_id = self.request.query_params.get('owner', None)
        if owner_id is not None:
            queryset = queryset.filter(owner_id=owner_id)
        # If authenticated, allow filtering by 'my' to get current user's items
        elif self.request.query_params.get('my', None) == 'true' and self.request.user.is_authenticated:
            queryset = queryset.filter(owner=self.request.user)
        # Filter featured items
        if self.request.query_params.get('featured', None) == 'true':
            queryset = queryset.filter(is_featured=True, is_available=True)
        # Filter barter items - include both is_barter=True and allow_barter=True items
        if self.request.query_params.get('is_barter', None) == 'true':
            queryset = queryset.filter(
                Q(is_barter=True) | Q(allow_barter=True),
                is_available=True
            )
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def set_featured(self, request, pk=None):
        """Set item as featured (requires active membership)"""
        item = self.get_object()
        
        # Check if user owns the item
        if item.owner != request.user:
            return Response({"detail": "You can only feature your own items"}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user has valid membership
        try:
            membership = request.user.membership
            if not membership.is_valid:
                return Response({"detail": "Active membership required to feature items"}, status=status.HTTP_403_FORBIDDEN)
        except:
            return Response({"detail": "Active membership required to feature items"}, status=status.HTTP_403_FORBIDDEN)
        
        item.is_featured = True
        item.save()
        return Response({"detail": "Item featured successfully"})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unset_featured(self, request, pk=None):
        """Remove featured status from item"""
        item = self.get_object()
        if item.owner != request.user:
            return Response({"detail": "You can only unfeature your own items"}, status=status.HTTP_403_FORBIDDEN)
        
        item.is_featured = False
        item.save()
        return Response({"detail": "Item unfeatured successfully"})

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
