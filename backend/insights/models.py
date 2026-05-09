from django.db import models
import uuid
from django.conf import settings

# Create your models here.
class Insights(models.Model):
    
    class Meta:
        verbose_name = 'Insight'
        verbose_name_plural = 'Insights'
        
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    questionnaire = models.ForeignKey('questionnaires.Questionnaires', on_delete=models.CASCADE)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    content = models.TextField()
    status = models.CharField(max_length=20, default='pending')  # pending, completed, failed
    created_at = models.DateTimeField(auto_now_add=True)
