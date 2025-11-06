from rest_framework import serializers
from .models import Wishlist, WishlistItem, WantToBuy
from apps.items.serializers import ItemSerializer

class WishlistItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    
    class Meta:
        model = WishlistItem
        fields = ['id', 'item', 'added_at', 'notes']

class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'items', 'created_at', 'updated_at']

class AddToWishlistSerializer(serializers.Serializer):
    item_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_item_id(self, value):
        from apps.items.models import Item
        try:
            item = Item.objects.get(id=value, is_available=True)
            return value
        except Item.DoesNotExist:
            raise serializers.ValidationError("Item not found or not available")

class WantToBuySerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = WantToBuy
        fields = [
            'id', 'user', 'user_username', 'title', 'description', 'category',
            'max_price', 'condition', 'location', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class WantToBuyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WantToBuy
        fields = [
            'title', 'description', 'category', 'max_price', 'condition', 'location'
        ]
