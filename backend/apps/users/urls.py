from django.urls import path

from .views import BudgetTokenObtainPairView, BudgetTokenRefreshView, ProfileView, RegisterView


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", BudgetTokenObtainPairView.as_view(), name="login"),
    path("refresh/", BudgetTokenRefreshView.as_view(), name="token-refresh"),
    path("me/", ProfileView.as_view(), name="profile"),
]
