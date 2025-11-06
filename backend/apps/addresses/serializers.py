from rest_framework import serializers
from .models import Address

class AddressSerializer(serializers.ModelSerializer):
    full_address = serializers.ReadOnlyField()
    
    class Meta:
        model = Address
        fields = [
            'id', 'name', 'address_type', 'recipient_name', 'phone_number',
            'address_line_1', 'address_line_2', 'city', 'state_province',
            'postal_code', 'country', 'is_default', 'is_active', 'created_at',
            'updated_at', 'full_address'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class AddressCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'name', 'address_type', 'recipient_name', 'phone_number',
            'address_line_1', 'address_line_2', 'city', 'state_province',
            'postal_code', 'country', 'is_default'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
