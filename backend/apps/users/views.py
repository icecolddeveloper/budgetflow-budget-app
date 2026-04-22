from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import BudgetTokenObtainPairSerializer, RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class BudgetTokenObtainPairView(TokenObtainPairView):
    serializer_class = BudgetTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class BudgetTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


class ProfileView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)
