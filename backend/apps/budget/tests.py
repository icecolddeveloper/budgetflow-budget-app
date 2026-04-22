from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase

from apps.budget.models import Category, Transaction
from apps.budget.services import create_transaction


class TransactionServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="sam", password="StrongPass123")
        self.food = Category.objects.create(
            user=self.user,
            name="Food",
            slug="food",
            color="#f97316",
            icon="utensils-crossed",
            monthly_budget=Decimal("300.00"),
            balance=Decimal("250.00"),
        )
        self.savings = Category.objects.create(
            user=self.user,
            name="Savings",
            slug="savings",
            color="#16a34a",
            icon="piggy-bank",
            monthly_budget=Decimal("500.00"),
            balance=Decimal("50.00"),
        )

    def test_transfer_moves_balance_between_categories(self):
        transaction = create_transaction(
            user=self.user,
            kind=Transaction.Kind.TRANSFER,
            amount="25.00",
            description="Weekly sweep",
            source_category=self.food,
            destination_category=self.savings,
        )

        self.food.refresh_from_db()
        self.savings.refresh_from_db()

        self.assertEqual(transaction.kind, Transaction.Kind.TRANSFER)
        self.assertEqual(self.food.balance, Decimal("225.00"))
        self.assertEqual(self.savings.balance, Decimal("75.00"))
