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
    queryset = Item.objects.filter(is_available=True)
    serializer_class = ItemSerializer
    # Allow anyone to view items (read), but require authentication for create/update/delete
    # IsAuthenticatedOrReadOnly allows unauthenticated users to read (GET, HEAD, OPTIONS)
    # IsOwnerOrReadOnly ensures only owners can modify their items
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def get_permissions(self):
        """
        Override to ensure list and retrieve actions are accessible to everyone
        """
        if self.action in ['list', 'retrieve']:
            # Allow anyone to list and view items (no authentication required)
            return [permissions.AllowAny()]
        # For create, update, delete - require authentication and ownership
        return super().get_permissions()

    def get_queryset(self):
        # By default, show only available items to all users
        queryset = Item.objects.filter(is_available=True)
        
        # Filter by owner if owner parameter is provided
        owner_id = self.request.query_params.get('owner', None)
        if owner_id is not None:
            queryset = queryset.filter(owner_id=owner_id)
        # If authenticated, allow filtering by 'my' to get current user's items (including unavailable)
        elif self.request.query_params.get('my', None) == 'true' and self.request.user.is_authenticated:
            queryset = Item.objects.filter(owner=self.request.user)  # Show all user's items, even unavailable
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
