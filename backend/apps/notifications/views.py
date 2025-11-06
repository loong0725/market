from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Notification, NotificationSettings, NotificationTemplate
from .serializers import NotificationSerializer, NotificationSettingsSerializer, NotificationTemplateSerializer

class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by notification type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset

class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class NotificationSettingsView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSettingsSerializer
    
    def get_object(self):
        settings, created = NotificationSettings.objects.get_or_create(user=self.request.user)
        return settings

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.mark_as_read()
    return Response(NotificationSerializer(notification).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'status': 'success'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({'unread_count': count})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_stats(request):
    """Get notification statistics for the user"""
    user = request.user
    
    # Total notifications
    total_notifications = Notification.objects.filter(user=user).count()
    unread_notifications = Notification.objects.filter(user=user, is_read=False).count()
    
    # Notifications by type
    notifications_by_type = Notification.objects.filter(user=user).values('notification_type').annotate(
        count=models.Count('id')
    ).order_by('-count')
    
    # Recent notifications (last 7 days)
    from django.utils import timezone
    from datetime import timedelta
    week_ago = timezone.now() - timedelta(days=7)
    recent_notifications = Notification.objects.filter(
        user=user,
        created_at__gte=week_ago
    ).count()
    
    return Response({
        'total_notifications': total_notifications,
        'unread_notifications': unread_notifications,
        'recent_notifications': recent_notifications,
        'notifications_by_type': list(notifications_by_type)
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_notification(request):
    """Create a new notification (for testing or admin use)"""
    serializer = NotificationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Utility functions for creating notifications
def create_notification(user, notification_type, title, message, priority='medium', **kwargs):
    """Create a notification for a user"""
    notification = Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        priority=priority,
        **kwargs
    )
    
    # Send real-time notification via WebSocket if available
    # This would be implemented with Django Channels or similar
    # send_websocket_notification(user, notification)
    
    return notification

def create_order_notification(order, notification_type, user=None):
    """Create order-related notification"""
    if user is None:
        user = order.buyer
    
    title = f"Order #{order.id} Update"
    message = f"Your order has been updated to {order.status}"
    
    return create_notification(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        related_order_id=order.id,
        priority='high' if notification_type in ['order_cancelled', 'payment_received'] else 'medium'
    )

def create_barter_notification(barter_transaction, notification_type, user=None):
    """Create barter-related notification"""
    if user is None:
        user = barter_transaction.responder
    
    title = f"Barter Request Update"
    message = f"Your barter request has been {barter_transaction.status}"
    
    return create_notification(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        related_barter_id=barter_transaction.id,
        priority='medium'
    )
