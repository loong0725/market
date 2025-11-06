from rest_framework import serializers
from .models import Category, CategoryParameter

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    full_path = serializers.ReadOnlyField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'parent', 'image_url', 'is_active', 'sort_order', 'created_at', 'children', 'full_path']
    
    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []

class CategoryParameterSerializer(serializers.ModelSerializer):
    choice_list = serializers.ReadOnlyField()
    
    class Meta:
        model = CategoryParameter
        fields = ['id', 'name', 'parameter_type', 'is_required', 'choices', 'choice_list', 'sort_order']

class CategoryWithParametersSerializer(CategorySerializer):
    parameters = CategoryParameterSerializer(source='parameters', many=True, read_only=True)
    
    class Meta(CategorySerializer.Meta):
        fields = CategorySerializer.Meta.fields + ['parameters']
