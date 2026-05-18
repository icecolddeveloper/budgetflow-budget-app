from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode


token_generator = PasswordResetTokenGenerator()


def make_password_reset_token(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = token_generator.make_token(user)
    return uid, token


def decode_password_reset_token(uid, token):
    User = get_user_model()
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return None
    if not token_generator.check_token(user, token):
        return None
    return user


def build_password_reset_link(uid, token):
    base = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")
    query = urlencode({"uid": uid, "token": token})
    return f"{base}/reset-password?{query}"


def send_password_reset_email(user):
    recipient = (user.email or "").strip()
    if not recipient:
        return False

    uid, token = make_password_reset_token(user)
    link = build_password_reset_link(uid, token)

    send_mail(
        subject="Reset your BudgetFlow password",
        message=(
            f"Hi {user.first_name or user.username},\n\n"
            "We received a request to reset your BudgetFlow password. "
            "Use the link below to choose a new one:\n"
            f"{link}\n\n"
            "This link expires in a few hours and will stop working "
            "once your password is changed. If you did not request a reset, "
            "you can safely ignore this email."
        ),
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@budgetflow.local"),
        recipient_list=[recipient],
        fail_silently=False,
    )
    return True
