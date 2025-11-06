from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.contrib.auth import login as auth_login
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from django.core.paginator import Paginator
from apps.users.models import User, UserMembership
from apps.items.models import Item
from apps.orders.models import Order
from apps.barter.models import BarterTransaction
from apps.wanted.models import WantedItem

def is_admin(user):
    return user.is_authenticated and user.is_staff

def admin_login_view(request):
    """Redirect to admin dashboard if logged in, otherwise to Django admin login"""
    if request.user.is_authenticated and request.user.is_staff:
        return redirect('admin_dashboard')
    # Redirect to Django admin login
    return redirect('/admin/login/?next=/manage/dashboard/')

@login_required
@user_passes_test(is_admin)
def admin_dashboard(request):
    """Main admin dashboard"""
    # Basic counts
    total_users = User.objects.count()
    verified_users = User.objects.filter(is_verified=True).count()
    total_items = Item.objects.count()
    available_items = Item.objects.filter(is_available=True).count()
    total_orders = Order.objects.count()
    completed_orders = Order.objects.filter(status='delivered').count()
    total_barter = BarterTransaction.objects.count()
    total_wanted = WantedItem.objects.filter(is_active=True).count()
    
    # Memberships
    active_memberships = UserMembership.objects.filter(
        is_active=True,
        end_date__gt=timezone.now()
    ).count()
    
    # Revenue
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
    
    # Previous week for comparison
    two_weeks_ago = timezone.now() - timedelta(days=14)
    prev_week_users = User.objects.filter(date_joined__gte=two_weeks_ago, date_joined__lt=week_ago).count()
    prev_week_items = Item.objects.filter(created_at__gte=two_weeks_ago, created_at__lt=week_ago).count()
    prev_week_orders = Order.objects.filter(created_at__gte=two_weeks_ago, created_at__lt=week_ago).count()
    
    # Daily trends (last 7 days)
    daily_stats = []
    for i in range(7):
        day_start = timezone.now() - timedelta(days=i+1)
        day_end = timezone.now() - timedelta(days=i)
        daily_stats.append({
            'date': day_start.date(),
            'users': User.objects.filter(date_joined__gte=day_start, date_joined__lt=day_end).count(),
            'items': Item.objects.filter(created_at__gte=day_start, created_at__lt=day_end).count(),
            'orders': Order.objects.filter(created_at__gte=day_start, created_at__lt=day_end).count(),
        })
    daily_stats.reverse()
    
    # Featured items
    featured_items = Item.objects.filter(is_featured=True, is_available=True).count()
    
    # Pending orders
    pending_orders = Order.objects.filter(status='pending').count()
    
    # Calculate growth rates
    user_growth = ((recent_users - prev_week_users) / prev_week_users * 100) if prev_week_users > 0 else 0
    item_growth = ((recent_items - prev_week_items) / prev_week_items * 100) if prev_week_items > 0 else 0
    order_growth = ((recent_orders - prev_week_orders) / prev_week_orders * 100) if prev_week_orders > 0 else 0
    
    context = {
        'total_users': total_users,
        'verified_users': verified_users,
        'total_items': total_items,
        'available_items': available_items,
        'total_orders': total_orders,
        'completed_orders': completed_orders,
        'pending_orders': pending_orders,
        'total_barter': total_barter,
        'total_wanted': total_wanted,
        'active_memberships': active_memberships,
        'total_revenue': float(total_revenue),
        'monthly_revenue': float(monthly_revenue),
        'recent_users': recent_users,
        'recent_items': recent_items,
        'recent_orders': recent_orders,
        'user_growth': round(user_growth, 1),
        'item_growth': round(item_growth, 1),
        'order_growth': round(order_growth, 1),
        'featured_items': featured_items,
        'daily_stats': daily_stats,
    }
    return render(request, 'admin/dashboard.html', context)

@login_required
@user_passes_test(is_admin)
def admin_users(request):
    """User management"""
    users = User.objects.annotate(
        items_count=Count('items'),
        orders_count=Count('orders'),
        sales_count=Count('sales')
    ).order_by('-date_joined')
    
    # Filters
    search = request.GET.get('search', '')
    if search:
        users = users.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(ait_email__icontains=search)
        )
    
    is_verified = request.GET.get('is_verified')
    if is_verified is not None:
        users = users.filter(is_verified=is_verified == '1')
    
    is_active = request.GET.get('is_active')
    if is_active is not None:
        users = users.filter(is_active=is_active == '1')
    
    # Pagination
    paginator = Paginator(users, 20)
    page = request.GET.get('page', 1)
    users_page = paginator.get_page(page)
    
    context = {
        'users': users_page,
        'search': search,
        'is_verified': is_verified,
        'is_active': is_active,
    }
    return render(request, 'admin/users.html', context)

@login_required
@user_passes_test(is_admin)
def admin_users_action(request, user_id):
    """User actions"""
    try:
        user = User.objects.get(id=user_id)
        action = request.POST.get('action')
        
        if action == 'toggle_active':
            user.is_active = not user.is_active
            user.save()
            messages.success(request, f'User {user.username} status updated')
        elif action == 'verify':
            user.is_verified = True
            user.save()
            messages.success(request, f'User {user.username} verified')
        
    except User.DoesNotExist:
        messages.error(request, 'User not found')
    
    return redirect('admin_users')

@login_required
@user_passes_test(is_admin)
def admin_items(request):
    """Item management"""
    items = Item.objects.select_related('owner').annotate(
        orders_count=Count('orders')
    ).order_by('-created_at')
    
    # Filters
    search = request.GET.get('search', '')
    if search:
        items = items.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(owner__username__icontains=search)
        )
    
    is_available = request.GET.get('is_available')
    if is_available is not None:
        items = items.filter(is_available=is_available == '1')
    
    is_featured = request.GET.get('is_featured')
    if is_featured is not None:
        items = items.filter(is_featured=is_featured == '1')
    
    is_barter = request.GET.get('is_barter')
    if is_barter is not None:
        items = items.filter(is_barter=is_barter == '1')
    
    # Pagination
    paginator = Paginator(items, 20)
    page = request.GET.get('page', 1)
    items_page = paginator.get_page(page)
    
    context = {
        'items': items_page,
        'search': search,
        'is_available': is_available,
        'is_featured': is_featured,
        'is_barter': is_barter,
    }
    return render(request, 'admin/items.html', context)

@login_required
@user_passes_test(is_admin)
def admin_items_action(request, item_id):
    """Item actions"""
    try:
        item = Item.objects.get(id=item_id)
        action = request.POST.get('action')
        
        if action == 'toggle_available':
            item.is_available = not item.is_available
            item.save()
            messages.success(request, f'Item {item.title} status updated')
        elif action == 'toggle_featured':
            item.is_featured = not item.is_featured
            item.save()
            messages.success(request, f'Item {item.title} featured status updated')
        elif action == 'delete':
            item.delete()
            messages.success(request, f'Item {item.title} deleted')
        
    except Item.DoesNotExist:
        messages.error(request, 'Item not found')
    
    return redirect('admin_items')

@login_required
@user_passes_test(is_admin)
def admin_orders(request):
    """Order management"""
    orders = Order.objects.select_related('buyer', 'seller', 'item').order_by('-created_at')
    
    # Filters
    search = request.GET.get('search', '')
    if search:
        orders = orders.filter(
            Q(buyer__username__icontains=search) |
            Q(seller__username__icontains=search) |
            Q(item__title__icontains=search)
        )
    
    status = request.GET.get('status')
    if status:
        orders = orders.filter(status=status)
    
    payment_status = request.GET.get('payment_status')
    if payment_status:
        orders = orders.filter(payment_status=payment_status)
    
    # Pagination
    paginator = Paginator(orders, 20)
    page = request.GET.get('page', 1)
    orders_page = paginator.get_page(page)
    
    context = {
        'orders': orders_page,
        'search': search,
        'status': status,
        'payment_status': payment_status,
    }
    return render(request, 'admin/orders.html', context)

@login_required
@user_passes_test(is_admin)
def admin_memberships(request):
    """Membership management"""
    memberships = UserMembership.objects.select_related('user').order_by('-start_date')
    
    search = request.GET.get('search', '')
    if search:
        memberships = memberships.filter(user__username__icontains=search)
    
    is_active = request.GET.get('is_active')
    if is_active is not None:
        now = timezone.now()
        if is_active == '1':
            memberships = memberships.filter(is_active=True, end_date__gt=now)
        else:
            memberships = memberships.exclude(is_active=True, end_date__gt=now)
    
    paginator = Paginator(memberships, 20)
    page = request.GET.get('page', 1)
    memberships_page = paginator.get_page(page)
    
    context = {
        'memberships': memberships_page,
        'search': search,
        'is_active': is_active,
    }
    return render(request, 'admin/memberships.html', context)

