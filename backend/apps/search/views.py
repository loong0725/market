from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q
from apps.items.models import Item
from apps.items.serializers import ItemSerializer
from apps.wishlist.models import WantToBuy
from apps.wishlist.serializers import WantToBuySerializer

class ItemSearchView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ItemSerializer
    
    def get_queryset(self):
        queryset = Item.objects.filter(is_available=True)
        
        # Search parameters
        query = self.request.query_params.get('q', '')
        category = self.request.query_params.get('category', '')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        condition = self.request.query_params.get('condition', '')
        location = self.request.query_params.get('location', '')
        is_barter = self.request.query_params.get('is_barter')
        sort_by = self.request.query_params.get('sort_by', 'created_at')
        sort_order = self.request.query_params.get('sort_order', 'desc')
        
        # Text search
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(category__icontains=query)
            )
        
        # Category filter
        if category:
            queryset = queryset.filter(
                Q(category__icontains=category) |
                Q(category_new__name__icontains=category)
            )
        
        # Price range filter
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
        
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
        
        # Condition filter
        if condition:
            queryset = queryset.filter(condition=condition)
        
        # Location filter
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Barter filter
        if is_barter is not None:
            queryset = queryset.filter(is_barter=is_barter.lower() == 'true')
        
        # Sorting
        if sort_order == 'desc':
            sort_by = f'-{sort_by}'
        queryset = queryset.order_by(sort_by)
        
        return queryset

class WantToBuySearchView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = WantToBuySerializer
    
    def get_queryset(self):
        queryset = WantToBuy.objects.filter(status='active')
        
        # Search parameters
        query = self.request.query_params.get('q', '')
        category = self.request.query_params.get('category', '')
        max_price = self.request.query_params.get('max_price')
        condition = self.request.query_params.get('condition', '')
        location = self.request.query_params.get('location', '')
        sort_by = self.request.query_params.get('sort_by', 'created_at')
        sort_order = self.request.query_params.get('sort_order', 'desc')
        
        # Text search
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(category__icontains=query)
            )
        
        # Category filter
        if category:
            queryset = queryset.filter(category__icontains=category)
        
        # Max price filter
        if max_price:
            try:
                queryset = queryset.filter(max_price__lte=float(max_price))
            except ValueError:
                pass
        
        # Condition filter
        if condition and condition != 'any':
            queryset = queryset.filter(condition=condition)
        
        # Location filter
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Sorting
        if sort_order == 'desc':
            sort_by = f'-{sort_by}'
        queryset = queryset.order_by(sort_by)
        
        return queryset

@api_view(['GET'])
@permission_classes([AllowAny])
def search_suggestions(request):
    """Return search suggestions based on popular items and categories"""
    query = request.query_params.get('q', '')
    
    if len(query) < 2:
        return Response({'suggestions': []})
    
    # Get popular item titles
    item_suggestions = Item.objects.filter(
        Q(title__icontains=query) | Q(category__icontains=query),
        is_available=True
    ).values_list('title', 'category').distinct()[:5]
    
    # Get popular categories
    category_suggestions = Item.objects.filter(
        category__icontains=query,
        is_available=True
    ).values_list('category', flat=True).distinct()[:3]
    
    suggestions = []
    
    # Add item suggestions
    for title, category in item_suggestions:
        suggestions.append({
            'type': 'item',
            'text': title,
            'category': category
        })
    
    # Add category suggestions
    for category in category_suggestions:
        if category:
            suggestions.append({
                'type': 'category',
                'text': category,
                'category': category
            })
    
    return Response({'suggestions': suggestions})

@api_view(['GET'])
@permission_classes([AllowAny])
def search_stats(request):
    """Return search statistics"""
    total_items = Item.objects.filter(is_available=True).count()
    total_want_to_buy = WantToBuy.objects.filter(status='active').count()
    
    # Popular categories
    from django.db.models import Count
    popular_categories = Item.objects.filter(
        is_available=True
    ).values('category').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    return Response({
        'total_items': total_items,
        'total_want_to_buy': total_want_to_buy,
        'popular_categories': list(popular_categories)
    })
