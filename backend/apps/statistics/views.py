from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from apps.items.models import Item
from apps.orders.models import Order
from apps.users.models import User
from apps.wishlist.models import WantToBuy
from apps.barter.models import BarterTransaction

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get general dashboard statistics"""
    
    # Basic counts
    total_items = Item.objects.filter(is_available=True).count()
    total_users = User.objects.filter(is_verified=True).count()
    total_orders = Order.objects.count()
    total_barter_requests = BarterTransaction.objects.count()
    total_want_to_buy = WantToBuy.objects.filter(status='active').count()
    
    # Recent activity (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_items = Item.objects.filter(created_at__gte=thirty_days_ago).count()
    recent_orders = Order.objects.filter(created_at__gte=thirty_days_ago).count()
    recent_users = User.objects.filter(date_joined__gte=thirty_days_ago).count()
    
    # Revenue stats
    total_revenue = Order.objects.filter(
        payment_status='paid'
    ).aggregate(total=Sum('total_price'))['total'] or 0
    
    monthly_revenue = Order.objects.filter(
        payment_status='paid',
        created_at__gte=thirty_days_ago
    ).aggregate(total=Sum('total_price'))['total'] or 0
    
    # Popular categories
    popular_categories = Item.objects.filter(
        is_available=True
    ).values('category').annotate(
        count=Count('id')
    ).order_by('-count')[:5]
    
    return Response({
        'overview': {
            'total_items': total_items,
            'total_users': total_users,
            'total_orders': total_orders,
            'total_barter_requests': total_barter_requests,
            'total_want_to_buy': total_want_to_buy,
        },
        'recent_activity': {
            'recent_items': recent_items,
            'recent_orders': recent_orders,
            'recent_users': recent_users,
        },
        'revenue': {
            'total_revenue': float(total_revenue),
            'monthly_revenue': float(monthly_revenue),
        },
        'popular_categories': list(popular_categories)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Get user-specific statistics"""
    user = request.user
    
    # User's items
    user_items = Item.objects.filter(owner=user)
    user_items_count = user_items.count()
    user_available_items = user_items.filter(is_available=True).count()
    
    # User's orders
    user_orders = Order.objects.filter(buyer=user)
    user_orders_count = user_orders.count()
    user_pending_orders = user_orders.filter(status='pending').count()
    user_completed_orders = user_orders.filter(status='delivered').count()
    
    # User's sales
    user_sales = Order.objects.filter(seller=user)
    user_sales_count = user_sales.count()
    user_pending_sales = user_sales.filter(status='pending').count()
    user_completed_sales = user_sales.filter(status='delivered').count()
    
    # User's revenue
    user_revenue = user_sales.filter(
        payment_status='paid'
    ).aggregate(total=Sum('total_price'))['total'] or 0
    
    # User's wishlist
    user_wishlist_count = user.wishlist.items.count() if hasattr(user, 'wishlist') else 0
    
    # User's want to buy
    user_want_to_buy_count = WantToBuy.objects.filter(user=user, status='active').count()
    
    return Response({
        'items': {
            'total': user_items_count,
            'available': user_available_items,
        },
        'orders': {
            'total': user_orders_count,
            'pending': user_pending_orders,
            'completed': user_completed_orders,
        },
        'sales': {
            'total': user_sales_count,
            'pending': user_pending_sales,
            'completed': user_completed_sales,
            'revenue': float(user_revenue),
        },
        'wishlist': {
            'count': user_wishlist_count,
        },
        'want_to_buy': {
            'count': user_want_to_buy_count,
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_analytics(request):
    """Get sales analytics data"""
    
    # Sales by status
    sales_by_status = Order.objects.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Sales by month (last 12 months)
    twelve_months_ago = timezone.now() - timedelta(days=365)
    monthly_sales = Order.objects.filter(
        created_at__gte=twelve_months_ago
    ).extra(
        select={'month': "DATE_TRUNC('month', created_at)"}
    ).values('month').annotate(
        count=Count('id'),
        revenue=Sum('total_price')
    ).order_by('month')
    
    # Top selling items
    top_items = Item.objects.annotate(
        order_count=Count('orders')
    ).filter(order_count__gt=0).order_by('-order_count')[:10]
    
    top_items_data = []
    for item in top_items:
        top_items_data.append({
            'id': item.id,
            'title': item.title,
            'order_count': item.order_count,
            'total_revenue': float(Order.objects.filter(
                item=item, payment_status='paid'
            ).aggregate(total=Sum('total_price'))['total'] or 0)
        })
    
    return Response({
        'sales_by_status': list(sales_by_status),
        'monthly_sales': list(monthly_sales),
        'top_items': top_items_data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def item_analytics(request):
    """Get item analytics data"""
    
    # Items by category
    items_by_category = Item.objects.filter(
        is_available=True
    ).values('category').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Items by condition
    items_by_condition = Item.objects.filter(
        is_available=True
    ).values('condition').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Price distribution
    price_ranges = [
        {'min': 0, 'max': 100, 'label': '0-100'},
        {'min': 100, 'max': 500, 'label': '100-500'},
        {'min': 500, 'max': 1000, 'label': '500-1000'},
        {'min': 1000, 'max': 5000, 'label': '1000-5000'},
        {'min': 5000, 'max': None, 'label': '5000+'},
    ]
    
    price_distribution = []
    for range_data in price_ranges:
        query = Item.objects.filter(is_available=True, price__isnull=False)
        if range_data['min'] is not None:
            query = query.filter(price__gte=range_data['min'])
        if range_data['max'] is not None:
            query = query.filter(price__lt=range_data['max'])
        
        count = query.count()
        price_distribution.append({
            'range': range_data['label'],
            'count': count
        })
    
    # Average prices by category
    avg_prices = Item.objects.filter(
        is_available=True, price__isnull=False
    ).values('category').annotate(
        avg_price=Avg('price')
    ).order_by('-avg_price')
    
    return Response({
        'items_by_category': list(items_by_category),
        'items_by_condition': list(items_by_condition),
        'price_distribution': price_distribution,
        'average_prices': list(avg_prices)
    })
