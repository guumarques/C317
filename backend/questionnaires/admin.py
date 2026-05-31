from django.contrib import admin
from .models import Questionnaires

@admin.register(Questionnaires)
class QuestionnaireAdmin(admin.ModelAdmin):
  list_display = ['id', 'user', 'answered_at']
  list_filter = ['user', 'answered_at']