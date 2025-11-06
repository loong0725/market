from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.ForumCategoryListView.as_view(), name='forum-category-list'),
    path('posts/', views.ForumPostListView.as_view(), name='forum-post-list'),
    path('posts/<int:pk>/', views.ForumPostDetailView.as_view(), name='forum-post-detail'),
    path('posts/<int:post_id>/replies/', views.ForumReplyListView.as_view(), name='forum-reply-list'),
    path('posts/<int:post_id>/like/', views.like_post, name='like-post'),
    path('replies/<int:reply_id>/like/', views.like_reply, name='like-reply'),
    path('replies/<int:reply_id>/solution/', views.mark_reply_as_solution, name='mark-reply-solution'),
    path('my-posts/', views.UserForumPostsView.as_view(), name='user-forum-posts'),
    path('stats/', views.forum_stats, name='forum-stats'),
]
