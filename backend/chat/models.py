from django.db import models
import uuid
from django.conf import settings

class ChatSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)

class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, choices=[
        ('user', 'Usuário'),
        ('assistant', 'Assistente'),
    ])
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)