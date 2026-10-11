from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenBlacklistView

from accounts.views import WebLoginView, WebLogoutView, csrf_token
from core.views import health


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health, name="health"),
    path("api/auth/csrf/", csrf_token),
    path("api/auth/web/login/", WebLoginView.as_view()),
    path("api/auth/web/logout/", WebLogoutView.as_view()),
    path("api/auth/jwt/logout/", TokenBlacklistView.as_view()),
    path("api/auth/", include("djoser.urls")),
    path("api/auth/", include("djoser.urls.jwt")),
]