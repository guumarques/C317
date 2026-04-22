import uuid
from django.db import models
from django.conf import settings

# Create your models here.
class Questionnaires(models.Model):
    
    class Meta:
        verbose_name = 'Questionnaire'
        verbose_name_plural = 'Questionnaires'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    stress_score = models.IntegerField()
    anxiety_score = models.IntegerField()
    burnout_score = models.IntegerField()
    depression_score = models.IntegerField()
    answered_at = models.DateTimeField(auto_now_add=True)