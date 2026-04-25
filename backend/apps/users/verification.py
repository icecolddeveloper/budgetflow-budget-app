from urllib.parse import urlencode

from django.conf import settings
from django.core import signing
from django.core.mail import send_mail


SIGNING_SALT = "budgetflow.email-verify"
TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24  # 24 hours


def make_verification_token(user):
    return signing.dumps({"user_id": user.pk}, salt=SIGNING_SALT)


def decode_verification_token(token):
    return signing.loads(token, salt=SIGNING_SALT, max_age=TOKEN_MAX_AGE_SECONDS)


def build_verification_link(token):
    base = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")
    query = urlencode({"token": token})
    return f"{base}/verify-email?{query}"


def send_verification_email(user):
    token = make_verification_token(user)
    link = build_verification_link(token)
    recipient = (user.email or "").strip()
    if not recipient:
        return False

    send_mail(
        subject="Verify your BudgetFlow email",
        message=(
            f"Hi {user.first_name or user.username},\n\n"
            "Confirm your email to finish setting up your BudgetFlow account:\n"
            f"{link}\n\n"
            "This link expires in 24 hours. If you did not create an account, "
            "you can safely ignore this message."
        ),
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@budgetflow.local"),
        recipient_list=[recipient],
        fail_silently=False,
    )
    return True
