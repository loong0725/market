from django.urls import path
from . import views

urlpatterns = [
    path('methods/', views.PaymentMethodListView.as_view(), name='payment-method-list'),
    path('methods/<int:pk>/', views.PaymentMethodDetailView.as_view(), name='payment-method-detail'),
    path('methods/type/<str:payment_type>/', views.payment_methods_by_type, name='payment-methods-by-type'),
    path('', views.PaymentListView.as_view(), name='payment-list'),
    path('<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    path('create-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('<int:payment_id>/refund/', views.refund_payment, name='refund-payment'),
    path('refunds/', views.PaymentRefundListView.as_view(), name='payment-refund-list'),
    path('webhook/<str:provider>/', views.payment_webhook, name='payment-webhook'),
]
