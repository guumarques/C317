from rest_framework import serializers
from .models import Consultation


class ConsultationEmployeeSerializer(serializers.Serializer):
    id         = serializers.UUIDField()
    first_name = serializers.CharField()
    last_name  = serializers.CharField()


class ConsultationSerializer(serializers.ModelSerializer):
    employee = ConsultationEmployeeSerializer(read_only=True)
    employee_id = serializers.UUIDField(write_only=True)

    class Meta:
        model  = Consultation
        fields = ['id', 'employee', 'employee_id', 'date', 'time', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        employee_id = validated_data.pop('employee_id')
        return Consultation.objects.create(employee_id=employee_id, **validated_data)