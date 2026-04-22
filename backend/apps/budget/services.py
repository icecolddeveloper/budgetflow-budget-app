from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import Category, Transaction


DEFAULT_CATEGORY_TEMPLATES = [
    {
        "name": "Food",
        "description": "Groceries, restaurants, and snacks.",
        "color": "#f97316",
        "icon": "utensils-crossed",
        "monthly_budget": Decimal("400.00"),
    },
    {
        "name": "Transport",
        "description": "Fuel, rideshares, public transit, and parking.",
        "color": "#0f766e",
        "icon": "car-front",
        "monthly_budget": Decimal("180.00"),
    },
    {
        "name": "Rent",
        "description": "Housing and living essentials.",
        "color": "#1d4ed8",
        "icon": "building-2",
        "monthly_budget": Decimal("1200.00"),
    },
    {
        "name": "Savings",
        "description": "Long-term goals and emergency reserves.",
        "color": "#16a34a",
        "icon": "piggy-bank",
        "monthly_budget": Decimal("500.00"),
    },
    {
        "name": "Entertainment",
        "description": "Streaming, hobbies, and fun money.",
        "color": "#dc2626",
        "icon": "party-popper",
        "monthly_budget": Decimal("150.00"),
    },
]


def seed_default_categories(user):
    existing_names = set(user.categories.values_list("name", flat=True))
    categories_to_create = []
    for template in DEFAULT_CATEGORY_TEMPLATES:
        if template["name"] in existing_names:
            continue
        categories_to_create.append(Category(user=user, slug=template["name"].lower(), **template))
    if categories_to_create:
        Category.objects.bulk_create(categories_to_create)


@transaction.atomic
def create_transaction(
    *,
    user,
    kind,
    amount,
    description="",
    source_category=None,
    destination_category=None,
    occurred_at=None,
):
    amount = Decimal(str(amount))
    if amount <= 0:
        raise ValidationError({"amount": "Amount must be greater than zero."})

    occurred_at = occurred_at or timezone.now()
    description = description.strip()

    if kind == Transaction.Kind.DEPOSIT:
        if not destination_category:
            raise ValidationError({"destination_category": "Choose a category to fund."})
        category = Category.objects.select_for_update().get(pk=destination_category.pk, user=user)
        category.balance += amount
        category.save(update_fields=["balance", "updated_at"])
        return Transaction.objects.create(
            user=user,
            kind=kind,
            amount=amount,
            description=description,
            destination_category=category,
            destination_category_name=category.name,
            occurred_at=occurred_at,
        )

    if kind == Transaction.Kind.WITHDRAW:
        if not source_category:
            raise ValidationError({"source_category": "Choose a category to spend from."})
        category = Category.objects.select_for_update().get(pk=source_category.pk, user=user)
        if category.balance < amount:
            raise ValidationError({"amount": "Insufficient category balance for this withdrawal."})
        category.balance -= amount
        category.save(update_fields=["balance", "updated_at"])
        return Transaction.objects.create(
            user=user,
            kind=kind,
            amount=amount,
            description=description,
            source_category=category,
            source_category_name=category.name,
            occurred_at=occurred_at,
        )

    if not source_category:
        raise ValidationError({"source_category": "Choose a source category."})
    if not destination_category:
        raise ValidationError({"destination_category": "Choose a destination category."})
    if source_category.pk == destination_category.pk:
        raise ValidationError({"destination_category": "Source and destination must be different."})

    source = Category.objects.select_for_update().get(pk=source_category.pk, user=user)
    destination = Category.objects.select_for_update().get(pk=destination_category.pk, user=user)

    if source.balance < amount:
        raise ValidationError({"amount": "Insufficient category balance for this transfer."})

    source.balance -= amount
    destination.balance += amount
    source.save(update_fields=["balance", "updated_at"])
    destination.save(update_fields=["balance", "updated_at"])

    return Transaction.objects.create(
        user=user,
        kind=kind,
        amount=amount,
        description=description,
        source_category=source,
        destination_category=destination,
        source_category_name=source.name,
        destination_category_name=destination.name,
        occurred_at=occurred_at,
    )
