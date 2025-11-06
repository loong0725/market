from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Address
from .serializers import AddressSerializer, AddressCreateSerializer

class AddressListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AddressCreateSerializer
        return AddressSerializer
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user, is_active=True)
    
    def perform_create(self, serializer):
        serializer.save()

class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_default_address(request, address_id):
    address = get_object_or_404(Address, id=address_id, user=request.user)
    
    # Unset other default addresses
    Address.objects.filter(user=request.user, is_default=True).update(is_default=False)
    
    # Set this address as default
    address.is_default = True
    address.save()
    
    return Response(AddressSerializer(address).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_default_address(request):
    try:
        address = Address.objects.get(user=request.user, is_default=True, is_active=True)
        return Response(AddressSerializer(address).data)
    except Address.DoesNotExist:
        return Response({'error': 'No default address found'}, status=status.HTTP_404_NOT_FOUND)
