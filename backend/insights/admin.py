from django.contrib import admin
from .models import Insights

@admin.register(Insights)
class InsightAdmin(admin.ModelAdmin):
  list_display = ['id', 'questionnaire', 'created_by', 'status', 'created_at']
  list_filter = ['questionnaire', 'created_by', 'status', 'created_at']