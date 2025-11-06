from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import PaymentMethod, Payment, PaymentRefund, PaymentWebhook
from .serializers import (
    PaymentMethodSerializer, PaymentMethodCreateSerializer,
    PaymentSerializer, PaymentCreateSerializer,
    PaymentRefundSerializer, PaymentRefundCreateSerializer,
    PaymentWebhookSerializer
)

class PaymentMethodListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PaymentMethodCreateSerializer
        return PaymentMethodSerializer
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user, is_active=True)

class PaymentMethodDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentMethodSerializer
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)

class PaymentListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)

class PaymentDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer
    
    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)

class PaymentRefundListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PaymentRefundCreateSerializer
        return PaymentRefundSerializer
    
    def get_queryset(self):
        return PaymentRefund.objects.filter(payment__user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Create a payment intent for processing"""
    order_id = request.data.get('order_id')
    payment_method_id = request.data.get('payment_method_id')
    
    if not order_id or not payment_method_id:
        return Response({'error': 'order_id and payment_method_id are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        from apps.orders.models import Order
        order = Order.objects.get(id=order_id, buyer=request.user)
        payment_method = PaymentMethod.objects.get(id=payment_method_id, user=request.user)
        
        # Create payment
        payment = Payment.objects.create(
            user=request.user,
            order=order,
            payment_method=payment_method,
            amount=order.total_price,
            currency='THB',
            provider=payment_method.payment_type
        )
        
        # Process payment based on provider
        if payment_method.payment_type == 'alipay':
            return process_alipay_payment(payment)
        elif payment_method.payment_type == 'paypal':
            return process_paypal_payment(payment)
        else:
            return Response({'error': 'Payment method not supported'}, 
                           status=status.HTTP_400_BAD_REQUEST)
    
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except PaymentMethod.DoesNotExist:
        return Response({'error': 'Payment method not found'}, status=status.HTTP_404_NOT_FOUND)

def process_alipay_payment(payment):
    """Process Alipay payment"""
    # This would integrate with Alipay SDK
    # For now, return a mock response
    payment.provider_transaction_id = f"alipay_{payment.id}_{payment.created_at.timestamp()}"
    payment.status = 'processing'
    payment.save()
    
    return Response({
        'payment_id': payment.id,
        'status': 'processing',
        'redirect_url': f"https://openapi.alipay.com/gateway.do?app_id=your_app_id&method=alipay.trade.page.pay&charset=utf-8&sign_type=RSA2&timestamp={payment.created_at.timestamp()}&version=1.0&notify_url={settings.ALIPAY_NOTIFY_URL}&return_url={settings.ALIPAY_RETURN_URL}&biz_content={{\"out_trade_no\":\"{payment.id}\",\"total_amount\":\"{payment.amount}\",\"subject\":\"Order {payment.order.id}\",\"product_code\":\"FAST_INSTANT_TRADE_PAY\"}}"
    })

def process_paypal_payment(payment):
    """Process PayPal payment"""
    # This would integrate with PayPal SDK
    # For now, return a mock response
    payment.provider_transaction_id = f"paypal_{payment.id}_{payment.created_at.timestamp()}"
    payment.status = 'processing'
    payment.save()
    
    return Response({
        'payment_id': payment.id,
        'status': 'processing',
        'redirect_url': f"https://www.paypal.com/checkoutnow?token=PAYPAL_TOKEN_{payment.id}"
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def payment_webhook(request, provider):
    """Handle payment provider webhooks"""
    # Store webhook data
    webhook = PaymentWebhook.objects.create(
        provider=provider,
        event_type=request.data.get('event_type', 'unknown'),
        raw_data=request.data
    )
    
    # Process webhook based on provider
    if provider == 'alipay':
        process_alipay_webhook(webhook)
    elif provider == 'paypal':
        process_paypal_webhook(webhook)
    
    return Response({'status': 'success'})

def process_alipay_webhook(webhook):
    """Process Alipay webhook"""
    # This would verify the webhook signature and update payment status
    webhook.processed = True
    webhook.save()

def process_paypal_webhook(webhook):
    """Process PayPal webhook"""
    # This would verify the webhook signature and update payment status
    webhook.processed = True
    webhook.save()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refund_payment(request, payment_id):
    """Create a refund for a payment"""
    payment = get_object_or_404(Payment, id=payment_id, user=request.user)
    
    if payment.status != 'completed':
        return Response({'error': 'Payment must be completed to refund'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    refund_amount = request.data.get('amount', payment.amount)
    reason = request.data.get('reason', 'Customer request')
    
    if refund_amount > payment.amount:
        return Response({'error': 'Refund amount cannot exceed payment amount'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    refund = PaymentRefund.objects.create(
        payment=payment,
        amount=refund_amount,
        reason=reason
    )
    
    return Response(PaymentRefundSerializer(refund).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_methods_by_type(request, payment_type):
    """Get payment methods by type"""
    methods = PaymentMethod.objects.filter(
        user=request.user,
        payment_type=payment_type,
        is_active=True
    )
    return Response(PaymentMethodSerializer(methods, many=True).data)
