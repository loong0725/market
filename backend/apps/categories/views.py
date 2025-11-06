from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Category, CategoryParameter
from .serializers import CategorySerializer, CategoryWithParametersSerializer, CategoryParameterSerializer

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True, parent__isnull=True)
    serializer_class = CategorySerializer

class CategoryDetailView(generics.RetrieveAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategoryWithParametersSerializer

class CategoryParameterListView(generics.ListAPIView):
    serializer_class = CategoryParameterSerializer
    
    def get_queryset(self):
        category_id = self.kwargs['category_id']
        return CategoryParameter.objects.filter(category_id=category_id)

@api_view(['GET'])
def category_tree(request):
    """Return the complete category tree structure"""
    def build_tree(categories):
        tree = []
        for category in categories:
            category_data = CategorySerializer(category).data
            children = category.children.filter(is_active=True)
            if children.exists():
                category_data['children'] = build_tree(children)
            else:
                category_data['children'] = []
            tree.append(category_data)
        return tree
    
    root_categories = Category.objects.filter(is_active=True, parent__isnull=True)
    tree = build_tree(root_categories)
    
    return Response(tree)
