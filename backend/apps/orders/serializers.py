from rest_framework import serializers
from .models import Order, OrderItem
from apps.items.serializers import ItemSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'item', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True)
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'buyer_username', 'seller', 'seller_username',
            'item', 'quantity', 'total_price', 'status', 'payment_status',
            'payment_method', 'shipping_address', 'notes', 'created_at', 'updated_at',
            'order_items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'item', 'quantity', 'shipping_address', 'notes'
        ]
    
    def create(self, validated_data):
        item = validated_data['item']
        quantity = validated_data['quantity']
        
        # Calculate total price
        if item.price:
            total_price = item.price * quantity
        else:
            total_price = 0
        
        # Create order
        order = Order.objects.create(
            buyer=self.context['request'].user,
            seller=item.owner,
            item=item,
            quantity=quantity,
            total_price=total_price,
            shipping_address=validated_data['shipping_address'],
            notes=validated_data.get('notes', '')
        )
        
        # Create order item
        OrderItem.objects.create(
            order=order,
            item=item,
            quantity=quantity,
            price=item.price or 0
        )
        
        return order
