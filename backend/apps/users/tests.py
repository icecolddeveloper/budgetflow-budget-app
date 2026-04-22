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
