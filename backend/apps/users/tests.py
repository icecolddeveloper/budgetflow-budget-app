from django.contrib.auth.models import User
from django.test import TestCase

from apps.users.serializers import RegisterSerializer


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
