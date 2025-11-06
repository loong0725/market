from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, UserSerializer
from .models import User
from .membership_serializers import UserMembershipSerializer, CreateMembershipSerializer

class RegisterView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Set is_verified to True by default (no email verification needed)
        user.is_verified = True
        user.save()
        return Response({"id": user.id, "username": user.username, "ait_email": user.ait_email}, status=status.HTTP_201_CREATED)

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user

class MembershipView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's membership status"""
        try:
            membership = request.user.membership
            serializer = UserMembershipSerializer(membership)
            return Response(serializer.data)
        except:
            return Response({"is_valid": False, "message": "No active membership"}, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create or extend membership"""
        serializer = CreateMembershipSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        membership = serializer.save()
        return Response(UserMembershipSerializer(membership).data, status=status.HTTP_201_CREATED)
