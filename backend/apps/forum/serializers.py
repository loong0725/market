from rest_framework import serializers
from .models import ForumCategory, ForumPost, ForumReply, PostLike, ReplyLike
from apps.users.serializers import UserSerializer

class ForumCategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumCategory
        fields = ['id', 'name', 'description', 'color', 'icon', 'is_active', 'sort_order', 'created_at', 'post_count']
    
    def get_post_count(self, obj):
        return obj.posts.filter(status='published').count()

class ForumReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    like_count = serializers.ReadOnlyField()
    
    class Meta:
        model = ForumReply
        fields = ['id', 'author', 'content', 'is_solution', 'like_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ForumPostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = ForumCategorySerializer(read_only=True)
    replies = ForumReplySerializer(many=True, read_only=True)
    like_count = serializers.ReadOnlyField()
    reply_count = serializers.ReadOnlyField()
    view_count = serializers.ReadOnlyField()
    
    class Meta:
        model = ForumPost
        fields = [
            'id', 'author', 'category', 'title', 'content', 'post_type', 'status',
            'is_pinned', 'is_locked', 'view_count', 'like_count', 'reply_count',
            'last_reply_at', 'created_at', 'updated_at', 'replies'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ForumPostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumPost
        fields = ['category', 'title', 'content', 'post_type']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class ForumReplyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumReply
        fields = ['content', 'is_solution']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLike
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['id', 'created_at']

class ReplyLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReplyLike
        fields = ['id', 'user', 'reply', 'created_at']
        read_only_fields = ['id', 'created_at']
