from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('<int:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('mark-all-read/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
    path('unread-count/', views.unread_count, name='unread-count'),
    path('stats/', views.notification_stats, name='notification-stats'),
    path('create/', views.create_notification, name='create-notification'),
    path('settings/', views.NotificationSettingsView.as_view(), name='notification-settings'),
]
