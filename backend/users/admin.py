from django.contrib import admin
from .models import User, Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_at']
    search_fields = ['name']


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'email', 'role', 'company', 'lgpd_consent']
    list_filter = ['role', 'company', 'lgpd_consent']
    search_fields = ['username', 'email']