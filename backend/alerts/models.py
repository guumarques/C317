from django.db import models
import uuid
from django.conf import settings

# Create your models here.
class Alerts(models.Model):
    
    class Meta:
        verbose_name = 'Alert'
        verbose_name_plural = 'Alerts'
        
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default='unread')
    reason = models.CharField(max_length=255, null=True, blank=True)
    triggered_at = models.DateTimeField(auto_now_add=True)