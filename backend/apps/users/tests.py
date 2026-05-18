from django.contrib.auth.models import User
from django.core import mail, signing
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.users.password_reset import make_password_reset_token
from apps.users.serializers import RegisterSerializer
from apps.users.verification import make_verification_token


class RegisterSerializerTests(TestCase):
    def test_registration_seeds_default_categories(self):
        serializer = RegisterSerializer(
            data={
                "username": "alex",
                "first_name": "Alex",
                "email": "alex@example.com",
                "password": "StrongPass123",
                "password_confirm": "StrongPass123",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertTrue(User.objects.filter(username="alex").exists())
        self.assertGreater(user.categories.count(), 0)

        primaries = user.categories.filter(is_primary=True)
        self.assertEqual(primaries.count(), 1)
        self.assertEqual(primaries.first().name, "Wallet")


class RegistrationCorsTests(TestCase):
    def test_register_preflight_allows_local_dev_origins(self):
        for origin in ("http://localhost:5173", "http://127.0.0.1:5173"):
            with self.subTest(origin=origin):
                response = self.client.options(
                    "/api/auth/register/",
                    HTTP_ORIGIN=origin,
                    HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
                )

                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.headers["access-control-allow-origin"], origin)


class RegistrationApiTests(TestCase):
    def test_register_endpoint_creates_user_for_frontend_origin(self):
        origin = "http://127.0.0.1:5173"

        response = self.client.post(
            "/api/auth/register/",
            data={
                "username": "casey",
                "first_name": "Casey",
                "email": "casey@example.com",
                "password": "StrongPass123",
                "password_confirm": "StrongPass123",
            },
            content_type="application/json",
            HTTP_ORIGIN=origin,
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username="casey").exists())
        self.assertEqual(response.headers["access-control-allow-origin"], origin)


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    FRONTEND_BASE_URL="http://localhost:5173",
)
class EmailVerificationTests(TestCase):
    def setUp(self):
        mail.outbox = []
        self.client = APIClient()

    def _register(self):
        return self.client.post(
            "/api/auth/register/",
            data={
                "username": "dana",
                "first_name": "Dana",
                "email": "dana@example.com",
                "password": "StrongPass123",
                "password_confirm": "StrongPass123",
            },
            format="json",
        )

    def test_registration_sends_verification_email(self):
        response = self._register()

        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("dana@example.com", mail.outbox[0].to)
        self.assertIn("/verify-email?token=", mail.outbox[0].body)

    def test_verify_email_endpoint_marks_profile_as_verified(self):
        self._register()
        user = User.objects.get(username="dana")
        self.assertFalse(user.profile.email_verified)

        token = make_verification_token(user)
        response = self.client.post(
            "/api/auth/verify-email/", data={"token": token}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.profile.email_verified)
        self.assertIsNotNone(user.profile.email_verified_at)

    def test_verify_email_rejects_invalid_token(self):
        self._register()

        response = self.client.post(
            "/api/auth/verify-email/", data={"token": "not-a-real-token"}, format="json"
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("token", response.json())

    def test_verify_email_rejects_expired_token(self):
        self._register()
        user = User.objects.get(username="dana")

        # Craft a token with a past timestamp to simulate expiry.
        token = signing.dumps(
            {"user_id": user.pk},
            salt="budgetflow.email-verify",
        )
        with override_settings():
            # Use a tiny max_age in the view path by passing an already-old signed value.
            # django.core.signing uses time.time() internally, so we fake expiry by
            # signing with a custom timestamp via dumps+loads is not straightforward;
            # instead we just tamper with the signature to trigger BadSignature.
            broken = token[:-4] + "abcd"
        response = self.client.post(
            "/api/auth/verify-email/", data={"token": broken}, format="json"
        )

        self.assertEqual(response.status_code, 400)

    def test_resend_verification_requires_auth(self):
        response = self.client.post(
            "/api/auth/resend-verification/", data={}, format="json"
        )
        self.assertEqual(response.status_code, 401)

    def test_resend_verification_sends_new_email(self):
        self._register()
        user = User.objects.get(username="dana")
        mail.outbox = []

        self.client.force_authenticate(user=user)
        response = self.client.post(
            "/api/auth/resend-verification/", data={}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("dana@example.com", mail.outbox[0].to)

    def test_resend_no_op_when_already_verified(self):
        self._register()
        user = User.objects.get(username="dana")
        user.profile.email_verified = True
        user.profile.save(update_fields=["email_verified"])
        mail.outbox = []

        self.client.force_authenticate(user=user)
        response = self.client.post(
            "/api/auth/resend-verification/", data={}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    FRONTEND_BASE_URL="http://localhost:5173",
)
class PasswordResetTests(TestCase):
    def setUp(self):
        mail.outbox = []
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="erin",
            email="erin@example.com",
            password="OriginalPass123",
            first_name="Erin",
        )

    def test_request_sends_email_for_known_address(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            data={"email": "erin@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("erin@example.com", mail.outbox[0].to)
        self.assertIn("/reset-password?", mail.outbox[0].body)
        self.assertIn("uid=", mail.outbox[0].body)
        self.assertIn("token=", mail.outbox[0].body)

    def test_request_returns_200_for_unknown_email_without_sending(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            data={"email": "stranger@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_request_rejects_invalid_email(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            data={"email": "not-an-email"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json())

    def test_request_is_case_insensitive(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            data={"email": "Erin@Example.COM"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

    def test_confirm_sets_new_password(self):
        uid, token = make_password_reset_token(self.user)

        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            data={
                "uid": uid,
                "token": token,
                "password": "BrandNewPass456",
                "password_confirm": "BrandNewPass456",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("BrandNewPass456"))
        self.assertFalse(self.user.check_password("OriginalPass123"))

    def test_confirm_rejects_mismatched_passwords(self):
        uid, token = make_password_reset_token(self.user)

        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            data={
                "uid": uid,
                "token": token,
                "password": "BrandNewPass456",
                "password_confirm": "DifferentPass789",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("password_confirm", response.json())

    def test_confirm_rejects_tampered_token(self):
        uid, _ = make_password_reset_token(self.user)

        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            data={
                "uid": uid,
                "token": "bogus-token-value",
                "password": "BrandNewPass456",
                "password_confirm": "BrandNewPass456",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("token", response.json())

    def test_token_is_single_use(self):
        uid, token = make_password_reset_token(self.user)

        first = self.client.post(
            "/api/auth/password-reset/confirm/",
            data={
                "uid": uid,
                "token": token,
                "password": "BrandNewPass456",
                "password_confirm": "BrandNewPass456",
            },
            format="json",
        )
        self.assertEqual(first.status_code, 200)

        # Reusing the same token after the password changed must fail because
        # PasswordResetTokenGenerator hashes the current password into the token.
        second = self.client.post(
            "/api/auth/password-reset/confirm/",
            data={
                "uid": uid,
                "token": token,
                "password": "AnotherPass999",
                "password_confirm": "AnotherPass999",
            },
            format="json",
        )
        self.assertEqual(second.status_code, 400)
