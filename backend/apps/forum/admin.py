from django.contrib import admin
from .models import ForumCategory, ForumPost, ForumReply, PostLike, ReplyLike

@admin.register(ForumCategory)
class ForumCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'sort_order', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    list_editable = ['is_active', 'sort_order']

@admin.register(ForumPost)
class ForumPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'post_type', 'status', 'is_pinned', 'is_locked', 'view_count', 'like_count', 'reply_count', 'created_at']
    list_filter = ['status', 'post_type', 'is_pinned', 'is_locked', 'category', 'created_at']
    search_fields = ['title', 'content', 'author__username']
    list_editable = ['status', 'is_pinned', 'is_locked']
    readonly_fields = ['view_count', 'like_count', 'reply_count', 'created_at', 'updated_at']

@admin.register(ForumReply)
class ForumReplyAdmin(admin.ModelAdmin):
    list_display = ['post', 'author', 'is_solution', 'like_count', 'created_at']
    list_filter = ['is_solution', 'created_at']
    search_fields = ['content', 'author__username', 'post__title']
    list_editable = ['is_solution']
    readonly_fields = ['like_count', 'created_at', 'updated_at']

@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'post__title']

@admin.register(ReplyLike)
class ReplyLikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'reply', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'reply__content']
