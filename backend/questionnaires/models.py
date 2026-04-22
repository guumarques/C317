import uuid
from django.db import models

# Create your models here.
class Questionnaires(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.ForeignKey('users.Users', on_delete=models.CASCADE)
    stress_score = models.IntegerField()
    anxiety_score = models.IntegerField()
    burnout_score = models.IntegerField()
    depression_score = models.IntegerField()
    answered_at = models.DateTimeField(auto_now_add=True)