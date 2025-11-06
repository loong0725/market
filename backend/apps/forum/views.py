from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import ForumCategory, ForumPost, ForumReply, PostLike, ReplyLike
from .serializers import (
    ForumCategorySerializer, ForumPostSerializer, ForumPostCreateSerializer,
    ForumReplySerializer, ForumReplyCreateSerializer, PostLikeSerializer, ReplyLikeSerializer
)

class ForumCategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ForumCategorySerializer
    queryset = ForumCategory.objects.filter(is_active=True)

class ForumPostListView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ForumPostCreateSerializer
        return ForumPostSerializer
    
    def get_queryset(self):
        queryset = ForumPost.objects.filter(status='published').select_related('author', 'category')
        
        # Filter by category
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by post type
        post_type = self.request.query_params.get('type')
        if post_type:
            queryset = queryset.filter(post_type=post_type)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        
        return queryset

class ForumPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    serializer_class = ForumPostSerializer
    
    def get_queryset(self):
        return ForumPost.objects.filter(status='published')
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_view_count()
        return super().retrieve(request, *args, **kwargs)

class ForumReplyListView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ForumReplyCreateSerializer
        return ForumReplySerializer
    
    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return ForumReply.objects.filter(post_id=post_id).select_related('author')
    
    def perform_create(self, serializer):
        post = get_object_or_404(ForumPost, id=self.kwargs['post_id'])
        serializer.save(post=post)

class UserForumPostsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ForumPostSerializer
    
    def get_queryset(self):
        return ForumPost.objects.filter(author=self.request.user).order_by('-created_at')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    post = get_object_or_404(ForumPost, id=post_id)
    like, created = PostLike.objects.get_or_create(user=request.user, post=post)
    
    if not created:
        like.delete()
        post.like_count = post.likes.count()
        post.save(update_fields=['like_count'])
        return Response({'liked': False})
    else:
        post.like_count = post.likes.count()
        post.save(update_fields=['like_count'])
        return Response({'liked': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_reply(request, reply_id):
    reply = get_object_or_404(ForumReply, id=reply_id)
    like, created = ReplyLike.objects.get_or_create(user=request.user, reply=reply)
    
    if not created:
        like.delete()
        reply.like_count = reply.likes.count()
        reply.save(update_fields=['like_count'])
        return Response({'liked': False})
    else:
        reply.like_count = reply.likes.count()
        reply.save(update_fields=['like_count'])
        return Response({'liked': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_reply_as_solution(request, reply_id):
    reply = get_object_or_404(ForumReply, id=reply_id)
    
    # Check if user is the post author
    if reply.post.author != request.user:
        return Response({'error': 'Only the post author can mark replies as solutions'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # Unmark other solutions for this post
    ForumReply.objects.filter(post=reply.post, is_solution=True).update(is_solution=False)
    
    # Mark this reply as solution
    reply.is_solution = True
    reply.save()
    
    return Response(ForumReplySerializer(reply).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def forum_stats(request):
    """Get forum statistics"""
    total_posts = ForumPost.objects.filter(status='published').count()
    total_replies = ForumReply.objects.count()
    total_users = ForumPost.objects.values('author').distinct().count()
    
    # Recent activity
    from django.utils import timezone
    from datetime import timedelta
    week_ago = timezone.now() - timedelta(days=7)
    recent_posts = ForumPost.objects.filter(created_at__gte=week_ago).count()
    recent_replies = ForumReply.objects.filter(created_at__gte=week_ago).count()
    
    return Response({
        'total_posts': total_posts,
        'total_replies': total_replies,
        'total_users': total_users,
        'recent_posts': recent_posts,
        'recent_replies': recent_replies,
    })
