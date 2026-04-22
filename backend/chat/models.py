from django.db import models
import uuid
from django.conf import settings

# Create your models here.
class ChatSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    
class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.ForeignKey('ChatSession', on_delete=models.CASCADE)
    role = models.CharField(max_length=50, choices=[
        ('user', 'Usuário'),
        ('bot', 'Chatbot'),
    ])
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)