from django.contrib import admin
from .models import ChatMessage, ChatSession

@admin.register(ChatSession)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'started_at']
    list_filter = ['user']

@admin.register(ChatMessage)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'role', 'sent_at']
    list_filter = ['session', 'role', 'sent_at']  