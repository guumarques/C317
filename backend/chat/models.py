from django.db import models
import uuid
from django.conf import settings


class ChatSession(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    psychologist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions_as_psychologist")
    employee     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions_as_employee")
    started_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("psychologist", "employee")  # um chat por par

    def __str__(self):
        return f"{self.psychologist} ↔ {self.employee}"


class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('psychologist', 'Psicólogo'),
        ('employee',     'Funcionário'),
    ]
    id      = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role    = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} - {self.sent_at}"