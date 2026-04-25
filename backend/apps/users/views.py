from django.contrib.auth import get_user_model
from django.core import signing
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import UserProfile
from .serializers import BudgetTokenObtainPairSerializer, RegisterSerializer, UserSerializer
from .verification import decode_verification_token, send_verification_email


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


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = (request.data.get("token") or "").strip()
        if not token:
            return Response(
                {"token": "A verification token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payload = decode_verification_token(token)
        except signing.SignatureExpired:
            return Response(
                {"token": "This verification link has expired. Request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except signing.BadSignature:
            return Response(
                {"token": "This verification link is invalid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_id = payload.get("user_id")
        User = get_user_model()
        user = User.objects.filter(pk=user_id).first()
        if user is None:
            return Response(
                {"token": "We could not find the account for this link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if not profile.email_verified:
            profile.email_verified = True
            profile.email_verified_at = timezone.now()
            profile.save(update_fields=["email_verified", "email_verified_at"])

        return Response({"email_verified": True}, status=status.HTTP_200_OK)


class ResendVerificationView(APIView):
    def post(self, request):
        profile = getattr(request.user, "profile", None)
        if profile and profile.email_verified:
            return Response(
                {"detail": "Your email is already verified."},
                status=status.HTTP_200_OK,
            )

        try:
            sent = send_verification_email(request.user)
        except Exception:
            return Response(
                {"detail": "We could not send the verification email right now."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not sent:
            return Response(
                {"detail": "Add an email address to your account first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"detail": "Verification email sent."}, status=status.HTTP_200_OK)
