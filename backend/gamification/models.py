from django.db import models
from django.conf import settings
import uuid

class GamificationEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=50)
    points = models.IntegerField()
    occurred_at = models.DateTimeField(auto_now_add=True)