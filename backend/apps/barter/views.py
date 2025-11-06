from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import BarterTransaction
from .serializers import BarterSerializer

class BarterViewSet(viewsets.ModelViewSet):
    queryset = BarterTransaction.objects.all()
    serializer_class = BarterSerializer
    permission_classes = [permissions.IsAuthenticated]
