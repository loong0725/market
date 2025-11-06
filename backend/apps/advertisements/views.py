from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from .models import Advertisement, AdClick, AdView
from .serializers import (
    AdvertisementSerializer, AdvertisementCreateSerializer,
    AdClickSerializer, AdViewSerializer, AdvertisementStatsSerializer
)

class AdvertisementListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdvertisementCreateSerializer
        return AdvertisementSerializer
    
    def get_queryset(self):
        return Advertisement.objects.filter(created_by=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save()

class AdvertisementDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AdvertisementSerializer
    
    def get_queryset(self):
        return Advertisement.objects.filter(created_by=self.request.user)

class PublicAdvertisementListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = AdvertisementSerializer
    
    def get_queryset(self):
        now = timezone.now()
        return Advertisement.objects.filter(
            status='active',
            start_date__lte=now,
            end_date__gte=now
        ).order_by('sort_order', '-created_at')

class AdvertisementStatsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AdvertisementStatsSerializer
    
    def get_queryset(self):
        return Advertisement.objects.filter(created_by=self.request.user)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_advertisements_by_position(request, position):
    """Get active advertisements for a specific position"""
    now = timezone.now()
    ads = Advertisement.objects.filter(
        status='active',
        start_date__lte=now,
        end_date__gte=now,
        position=position
    ).order_by('sort_order', '-created_at')
    
    return Response(AdvertisementSerializer(ads, many=True).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def track_ad_view(request, ad_id):
    """Track advertisement view"""
    ad = get_object_or_404(Advertisement, id=ad_id)
    
    # Get client IP
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip_address = x_forwarded_for.split(',')[0]
    else:
        ip_address = request.META.get('REMOTE_ADDR')
    
    # Create view record
    AdView.objects.create(
        advertisement=ad,
        user=request.user if request.user.is_authenticated else None,
        ip_address=ip_address,
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        page_url=request.META.get('HTTP_REFERER', '')
    )
    
    # Update view count
    ad.view_count += 1
    ad.save(update_fields=['view_count'])
    
    return Response({'status': 'success'})

@api_view(['POST'])
@permission_classes([AllowAny])
def track_ad_click(request, ad_id):
    """Track advertisement click"""
    ad = get_object_or_404(Advertisement, id=ad_id)
    
    # Get client IP
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip_address = x_forwarded_for.split(',')[0]
    else:
        ip_address = request.META.get('REMOTE_ADDR')
    
    # Create click record
    AdClick.objects.create(
        advertisement=ad,
        user=request.user if request.user.is_authenticated else None,
        ip_address=ip_address,
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        referer=request.META.get('HTTP_REFERER', '')
    )
    
    # Update click count
    ad.click_count += 1
    ad.save(update_fields=['click_count'])
    
    return Response({'status': 'success'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def advertisement_analytics(request, ad_id):
    """Get detailed analytics for an advertisement"""
    ad = get_object_or_404(Advertisement, id=ad_id, created_by=request.user)
    
    # Get recent clicks and views
    recent_clicks = AdClick.objects.filter(advertisement=ad).order_by('-clicked_at')[:10]
    recent_views = AdView.objects.filter(advertisement=ad).order_by('-viewed_at')[:10]
    
    # Get daily stats for the last 30 days
    from datetime import timedelta
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    daily_clicks = AdClick.objects.filter(
        advertisement=ad,
        clicked_at__gte=thirty_days_ago
    ).extra(
        select={'day': "DATE(clicked_at)"}
    ).values('day').annotate(
        count=models.Count('id')
    ).order_by('day')
    
    daily_views = AdView.objects.filter(
        advertisement=ad,
        viewed_at__gte=thirty_days_ago
    ).extra(
        select={'day': "DATE(viewed_at)"}
    ).values('day').annotate(
        count=models.Count('id')
    ).order_by('day')
    
    return Response({
        'advertisement': AdvertisementSerializer(ad).data,
        'recent_clicks': AdClickSerializer(recent_clicks, many=True).data,
        'recent_views': AdViewSerializer(recent_views, many=True).data,
        'daily_clicks': list(daily_clicks),
        'daily_views': list(daily_views)
    })
