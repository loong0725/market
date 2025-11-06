from rest_framework import serializers
from .models import PaymentMethod, Payment, PaymentRefund, PaymentWebhook

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'payment_type', 'name', 'is_default', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class PaymentMethodCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['payment_type', 'name', 'is_default']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class PaymentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'user_username', 'order', 'order_id', 'payment_method',
            'payment_method_name', 'amount', 'currency', 'status', 'provider',
            'provider_transaction_id', 'created_at', 'updated_at', 'completed_at',
            'failure_reason', 'refund_amount'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at']

class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['order', 'payment_method', 'amount', 'currency', 'provider']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class PaymentRefundSerializer(serializers.ModelSerializer):
    payment_id = serializers.IntegerField(source='payment.id', read_only=True)
    
    class Meta:
        model = PaymentRefund
        fields = [
            'id', 'payment', 'payment_id', 'amount', 'reason', 'status',
            'provider_refund_id', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at']

class PaymentRefundCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentRefund
        fields = ['payment', 'amount', 'reason']
    
    def create(self, validated_data):
        return super().create(validated_data)

class PaymentWebhookSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentWebhook
        fields = ['id', 'provider', 'event_type', 'raw_data', 'processed', 'created_at']
        read_only_fields = ['id', 'created_at']
