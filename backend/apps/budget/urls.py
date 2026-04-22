from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, DashboardView, TransactionViewSet


router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("transactions", TransactionViewSet, basename="transaction")


urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("", include(router.urls)),
]
