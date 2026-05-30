from rest_framework import serializers

from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True, allow_blank=False)
    last_name = serializers.CharField(required=True, allow_blank=False)
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'company',
            'role',
            'lgpd_consent',
        ]
        read_only_fields = ['id']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este e-mail já está em uso.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'As senhas não coincidem.'
        })
        if not attrs.get('lgpd_consent'):
            raise serializers.ValidationError({
                'lgpd_consent': 'É necessário aceitar os termos da LGPD para realizar o cadastro.'
        })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')

        if validated_data.get('lgpd_consent'):
            validated_data['consent_at'] = timezone.now()

        return User.objects.create_user(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'company',
            'company_name',
            'role',
            'lgpd_consent',
            'consent_at',
            'login_streak',
            'total_points',
        ]
        read_only_fields = [
            'id',
            'consent_at',
            'login_streak',
            'total_points',
        ]