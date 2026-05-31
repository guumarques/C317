from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.models import update_last_login
from django.utils import timezone
from .serializer import RegisterSerializer, UserSerializer
from .permissions import HasAcceptedLGPD

User = get_user_model()

# Create your views here.

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            username = request.data.get('username')
            user = User.objects.filter(username=username).first()

            if user:
                update_last_login(None, user)

        return response
    
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response(
                {'error': 'Refresh token é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {'message': 'Logout realizado com sucesso.'},
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {'error': 'Token inválido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated, HasAcceptedLGPD]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
        
class AcceptLGPDView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.lgpd_consent:
            return Response(
                {'message': 'Termos da LGPD já foram aceitos.'},
                status=status.HTTP_200_OK
            )

        user.lgpd_consent = True
        user.consent_at = timezone.now()
        user.save(update_fields=['lgpd_consent', 'consent_at'])

        return Response(
            {
                'message': 'Termos da LGPD aceitos com sucesso.',
                'lgpd_consent': user.lgpd_consent,
                'consent_at': user.consent_at,
            },
            status=status.HTTP_200_OK
        )