from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    email_verified = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "email", "email_verified")

    def get_email_verified(self, obj):
        profile = getattr(obj, "profile", None)
        return bool(profile and profile.email_verified)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "first_name", "email", "password", "password_confirm")

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        validated_data["email"] = validated_data.get("email", "").lower().strip()
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        from apps.budget.services import seed_default_categories
        from apps.users.verification import send_verification_email

        seed_default_categories(user)
        try:
            send_verification_email(user)
        except Exception:
            # Email delivery is best-effort during registration; user can resend later.
            pass
        return user


class BudgetTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
