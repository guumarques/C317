from django.contrib import admin
from .models import User, Company
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_at']
    search_fields = ['name']


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'company', 'last_login']
    list_filter  = ['role', 'company']
    fieldsets    = UserAdmin.fieldsets + (
        ('Dados extras', {'fields': ('role', 'company', 'lgpd_consent', 'login_streak', 'total_points')}),
    )