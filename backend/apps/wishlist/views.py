from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Wishlist, WishlistItem, WantToBuy
from .serializers import (
    WishlistSerializer, AddToWishlistSerializer, 
    WantToBuySerializer, WantToBuyCreateSerializer
)

class WishlistView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WishlistSerializer
    
    def get_object(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist

class WantToBuyListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WantToBuyCreateSerializer
        return WantToBuySerializer
    
    def get_queryset(self):
        return WantToBuy.objects.filter(status='active').order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WantToBuyDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WantToBuySerializer
    
    def get_queryset(self):
        return WantToBuy.objects.filter(user=self.request.user)

class UserWantToBuyListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WantToBuySerializer
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return WantToBuy.objects.filter(user_id=user_id, status='active').order_by('-created_at')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    serializer = AddToWishlistSerializer(data=request.data)
    if serializer.is_valid():
        item_id = serializer.validated_data['item_id']
        notes = serializer.validated_data.get('notes', '')
        
        from apps.items.models import Item
        item = get_object_or_404(Item, id=item_id, is_available=True)
        
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        wishlist_item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist,
            item=item,
            defaults={'notes': notes}
        )
        
        if not created:
            return Response({'error': 'Item already in wishlist'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(WishlistSerializer(wishlist).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, item_id):
    wishlist = get_object_or_404(Wishlist, user=request.user)
    wishlist_item = get_object_or_404(WishlistItem, wishlist=wishlist, item_id=item_id)
    wishlist_item.delete()
    
    return Response(WishlistSerializer(wishlist).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_want_to_buy_fulfilled(request, want_to_buy_id):
    want_to_buy = get_object_or_404(WantToBuy, id=want_to_buy_id, user=request.user)
    want_to_buy.status = 'fulfilled'
    want_to_buy.save()
    
    return Response(WantToBuySerializer(want_to_buy).data)
