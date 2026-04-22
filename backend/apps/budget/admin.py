from django.contrib import admin

from .models import Category, Transaction


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "balance", "monthly_budget", "updated_at")
    search_fields = ("name", "user__username")
    list_filter = ("user",)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("kind", "user", "amount", "source_category_name", "destination_category_name", "occurred_at")
    search_fields = ("description", "user__username", "source_category_name", "destination_category_name")
    list_filter = ("kind", "user")
