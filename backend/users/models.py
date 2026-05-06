import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True)
    role = models.CharField(max_length=50, choices=[
        ('employee', 'Funcionário'),
        ('psychologist', 'Psicólogo'),
        ('manager', 'Gestor'),
    ])
    lgpd_consent = models.BooleanField(default=False)
    consent_at = models.DateTimeField(null=True, blank=True)
    login_streak = models.IntegerField(default=0)
    total_points = models.IntegerField(default=0)