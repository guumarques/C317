from django.db import models
import uuid


class Consultation(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    psychologist = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="consultations_given")
    employee     = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="consultations_received")
    date         = models.DateField()
    notes        = models.TextField(blank=True, default="")
    created_at   = models.DateTimeField(auto_now_add=True)
    time = models.TimeField(null=True, blank=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"Consulta {self.employee} - {self.date}"