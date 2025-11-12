from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .models import WantedItem
from .serializers import WantedItemSerializer

# Constants
WANTED_POST_FEE = 10.0  # THB
MEMBER_FREE_POSTS = 3  # Free posts for premium members

def is_premium_member(user):
    """Check if user has active premium membership"""
    try:
        membership = user.membership
        return membership.is_valid
    except:
        return False

def get_free_posts_used(user):
    """Get count of free posts used by user (within current membership period)"""
    if not is_premium_member(user):
        return 0
    
    try:
        membership = user.membership
        # Count free posts created during membership period
        free_posts = WantedItem.objects.filter(
            user=user,
            is_free_post=True,
            created_at__gte=membership.start_date
        ).count()
        return free_posts
    except:
        return 0

def can_post_free(user):
    """Check if user can post for free (premium member with free posts remaining)"""
    if not is_premium_member(user):
        return False
    return get_free_posts_used(user) < MEMBER_FREE_POSTS

class WantedItemViewSet(viewsets.ModelViewSet):
    queryset = WantedItem.objects.filter(is_active=True)
    serializer_class = WantedItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = WantedItem.objects.filter(is_active=True)
        user_id = self.request.query_params.get('user', None)
        if user_id is not None:
            queryset = queryset.filter(user_id=user_id)
        elif self.request.query_params.get('my', None) == 'true' and self.request.user.is_authenticated:
            queryset = queryset.filter(user=self.request.user)
        return queryset

    def create(self, request, *args, **kwargs):
        """Override create to handle payment logic"""
        user = request.user
        
        # Check if user can post for free
        can_free = can_post_free(user)
        
        # Check if payment is required
        requires_payment = not can_free
        
        # For now, we'll allow the post but mark it appropriately
        # In a real implementation, you would integrate with a payment gateway
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if can_free:
            # Mark as free post
            wanted_item = serializer.save(
                user=user,
                is_free_post=True,
                paid_amount=0
            )
            return Response({
                'message': f'Posted successfully using free credit ({get_free_posts_used(user)}/{MEMBER_FREE_POSTS} used)',
                'data': WantedItemSerializer(wanted_item).data
            }, status=status.HTTP_201_CREATED)
        else:
            # Check if payment was provided
            paid_amount = request.data.get('paid_amount', 0)
            
            if is_premium_member(user):
                # Premium member but no free posts left
                if float(paid_amount) < WANTED_POST_FEE:
                    return Response({
                        'error': f'Payment required: {WANTED_POST_FEE} THB (or upgrade membership for free posts)',
                        'required_amount': WANTED_POST_FEE,
                        'free_posts_used': get_free_posts_used(user),
                        'free_posts_remaining': max(0, MEMBER_FREE_POSTS - get_free_posts_used(user))
                    }, status=status.HTTP_402_PAYMENT_REQUIRED)
            else:
                # Non-premium member
                if float(paid_amount) < WANTED_POST_FEE:
                    return Response({
                        'error': f'Payment required: {WANTED_POST_FEE} THB (or become a premium member for 3 free posts)',
                        'required_amount': WANTED_POST_FEE,
                        'premium_benefit': f'Premium members get {MEMBER_FREE_POSTS} free posts'
                    }, status=status.HTTP_402_PAYMENT_REQUIRED)
            
            # Create post with payment
            wanted_item = serializer.save(
                user=user,
                is_free_post=False,
                paid_amount=float(paid_amount)
            )
            return Response({
                'message': 'Posted successfully',
                'data': WantedItemSerializer(wanted_item).data
            }, status=status.HTTP_201_CREATED)
    
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_post_info(request):
    """Get information about posting requirements for current user"""
    user = request.user
    is_premium = is_premium_member(user)
    free_posts_used = get_free_posts_used(user) if is_premium else 0
    free_posts_remaining = max(0, MEMBER_FREE_POSTS - free_posts_used) if is_premium else 0
    can_free = can_post_free(user)
    
    return Response({
        'is_premium': is_premium,
        'free_posts_used': free_posts_used,
        'free_posts_remaining': free_posts_remaining,
        'can_post_free': can_free,
        'posting_fee': WANTED_POST_FEE if not can_free else 0,
        'member_free_posts': MEMBER_FREE_POSTS
    })

