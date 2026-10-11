from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class MovieNightUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Movie Night", {"fields": ("country",)}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Movie Night", {"fields": ("country",)}),
    )

    list_display = (
        "username",
        "email",
        "country",
        "is_staff",
        "is_active",
    )