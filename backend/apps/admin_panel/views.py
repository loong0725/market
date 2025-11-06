from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from apps.users.models import User
from apps.items.models import Item
from apps.orders.models import Order
from apps.barter.models import BarterTransaction
from apps.wishlist.models import WantToBuy
from apps.forum.models import ForumPost
from apps.advertisements.models import Advertisement
from apps.notifications.models import Notification

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    """Admin dashboard with comprehensive statistics"""
    
    # Basic counts
    total_users = User.objects.count()
    verified_users = User.objects.filter(is_verified=True).count()
    total_items = Item.objects.count()
    available_items = Item.objects.filter(is_available=True).count()
    total_orders = Order.objects.count()
    completed_orders = Order.objects.filter(status='delivered').count()
    total_barter_requests = BarterTransaction.objects.count()
    total_forum_posts = ForumPost.objects.count()
    total_advertisements = Advertisement.objects.count()
    
    # Revenue statistics
    total_revenue = Order.objects.filter(
        payment_status='paid'
    ).aggregate(total=Sum('total_price'))['total'] or 0
    
    monthly_revenue = Order.objects.filter(
        payment_status='paid',
        created_at__gte=timezone.now() - timedelta(days=30)
    ).aggregate(total=Sum('total_price'))['total'] or 0
    
    # Recent activity (last 7 days)
    week_ago = timezone.now() - timedelta(days=7)
    recent_users = User.objects.filter(date_joined__gte=week_ago).count()
    recent_items = Item.objects.filter(created_at__gte=week_ago).count()
    recent_orders = Order.objects.filter(created_at__gte=week_ago).count()
    recent_posts = ForumPost.objects.filter(created_at__gte=week_ago).count()
    
    # Popular categories
    popular_categories = Item.objects.filter(
        is_available=True
    ).values('category').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    # Order status distribution
    order_status_dist = Order.objects.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # User registration over time (last 12 months)
    twelve_months_ago = timezone.now() - timedelta(days=365)
    monthly_registrations = User.objects.filter(
        date_joined__gte=twelve_months_ago
    ).extra(
        select={'month': "DATE_TRUNC('month', date_joined)"}
    ).values('month').annotate(
        count=Count('id')
    ).order_by('month')
    
    return Response({
        'overview': {
            'total_users': total_users,
            'verified_users': verified_users,
            'total_items': total_items,
            'available_items': available_items,
            'total_orders': total_orders,
            'completed_orders': completed_orders,
            'total_barter_requests': total_barter_requests,
            'total_forum_posts': total_forum_posts,
            'total_advertisements': total_advertisements,
        },
        'revenue': {
            'total_revenue': float(total_revenue),
            'monthly_revenue': float(monthly_revenue),
        },
        'recent_activity': {
            'recent_users': recent_users,
            'recent_items': recent_items,
            'recent_orders': recent_orders,
            'recent_posts': recent_posts,
        },
        'popular_categories': list(popular_categories),
        'order_status_distribution': list(order_status_dist),
        'monthly_registrations': list(monthly_registrations)
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_management(request):
    """User management data"""
    users = User.objects.select_related().annotate(
        items_count=Count('items'),
        orders_count=Count('orders'),
        sales_count=Count('sales')
    ).order_by('-date_joined')
    
    # Filter by verification status
    is_verified = request.query_params.get('is_verified')
    if is_verified is not None:
        users = users.filter(is_verified=is_verified.lower() == 'true')
    
    # Filter by active status
    is_active = request.query_params.get('is_active')
    if is_active is not None:
        users = users.filter(is_active=is_active.lower() == 'true')
    
    # Search by username or email
    search = request.query_params.get('search')
    if search:
        users = users.filter(
            Q(username__icontains=search) | 
            Q(email__icontains=search) |
            Q(ait_email__icontains=search)
        )
    
    # Pagination
    page_size = int(request.query_params.get('page_size', 20))
    page = int(request.query_params.get('page', 1))
    start = (page - 1) * page_size
    end = start + page_size
    
    users_data = []
    for user in users[start:end]:
        users_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'ait_email': user.ait_email,
            'is_verified': user.is_verified,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
            'items_count': user.items_count,
            'orders_count': user.orders_count,
            'sales_count': user.sales_count,
        })
    
    return Response({
        'users': users_data,
        'total_count': users.count(),
        'page': page,
        'page_size': page_size
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def item_management(request):
    """Item management data"""
    items = Item.objects.select_related('owner', 'category_new').annotate(
        orders_count=Count('orders')
    ).order_by('-created_at')
    
    # Filter by availability
    is_available = request.query_params.get('is_available')
    if is_available is not None:
        items = items.filter(is_available=is_available.lower() == 'true')
    
    # Filter by category
    category = request.query_params.get('category')
    if category:
        items = items.filter(
            Q(category__icontains=category) |
            Q(category_new__name__icontains=category)
        )
    
    # Search
    search = request.query_params.get('search')
    if search:
        items = items.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(owner__username__icontains=search)
        )
    
    # Pagination
    page_size = int(request.query_params.get('page_size', 20))
    page = int(request.query_params.get('page', 1))
    start = (page - 1) * page_size
    end = start + page_size
    
    items_data = []
    for item in items[start:end]:
        items_data.append({
            'id': item.id,
            'title': item.title,
            'owner': item.owner.username,
            'category': item.category or (item.category_new.name if item.category_new else ''),
            'price': float(item.price) if item.price else None,
            'is_available': item.is_available,
            'is_barter': item.is_barter,
            'condition': item.condition,
            'created_at': item.created_at,
            'orders_count': item.orders_count,
        })
    
    return Response({
        'items': items_data,
        'total_count': items.count(),
        'page': page,
        'page_size': page_size
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def order_management(request):
    """Order management data"""
    orders = Order.objects.select_related('buyer', 'seller', 'item').order_by('-created_at')
    
    # Filter by status
    status = request.query_params.get('status')
    if status:
        orders = orders.filter(status=status)
    
    # Filter by payment status
    payment_status = request.query_params.get('payment_status')
    if payment_status:
        orders = orders.filter(payment_status=payment_status)
    
    # Search
    search = request.query_params.get('search')
    if search:
        orders = orders.filter(
            Q(buyer__username__icontains=search) |
            Q(seller__username__icontains=search) |
            Q(item__title__icontains=search)
        )
    
    # Pagination
    page_size = int(request.query_params.get('page_size', 20))
    page = int(request.query_params.get('page', 1))
    start = (page - 1) * page_size
    end = start + page_size
    
    orders_data = []
    for order in orders[start:end]:
        orders_data.append({
            'id': order.id,
            'buyer': order.buyer.username,
            'seller': order.seller.username,
            'item': order.item.title,
            'quantity': order.quantity,
            'total_price': float(order.total_price),
            'status': order.status,
            'payment_status': order.payment_status,
            'payment_method': order.payment_method,
            'created_at': order.created_at,
            'updated_at': order.updated_at,
        })
    
    return Response({
        'orders': orders_data,
        'total_count': orders.count(),
        'page': page,
        'page_size': page_size
    })

@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_action(request):
    """Perform bulk actions on items or users"""
    action = request.data.get('action')
    item_ids = request.data.get('item_ids', [])
    user_ids = request.data.get('user_ids', [])
    
    if action == 'activate_items':
        Item.objects.filter(id__in=item_ids).update(is_available=True)
        return Response({'status': 'success', 'message': f'Activated {len(item_ids)} items'})
    
    elif action == 'deactivate_items':
        Item.objects.filter(id__in=item_ids).update(is_available=False)
        return Response({'status': 'success', 'message': f'Deactivated {len(item_ids)} items'})
    
    elif action == 'verify_users':
        User.objects.filter(id__in=user_ids).update(is_verified=True)
        return Response({'status': 'success', 'message': f'Verified {len(user_ids)} users'})
    
    elif action == 'deactivate_users':
        User.objects.filter(id__in=user_ids).update(is_active=False)
        return Response({'status': 'success', 'message': f'Deactivated {len(user_ids)} users'})
    
    else:
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def system_health(request):
    """System health check"""
    from django.db import connection
    from django.core.cache import cache
    
    # Database health
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    # Cache health
    try:
        cache.set('health_check', 'ok', 10)
        cache_status = "healthy" if cache.get('health_check') == 'ok' else "error"
    except Exception as e:
        cache_status = f"error: {str(e)}"
    
    # Recent errors (if logging is set up)
    recent_errors = 0  # This would be implemented with proper logging
    
    return Response({
        'database': db_status,
        'cache': cache_status,
        'recent_errors': recent_errors,
        'timestamp': timezone.now().isoformat()
    })
