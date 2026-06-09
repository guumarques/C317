from datetime import timedelta
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import update_last_login
from django.utils import timezone
from gamification.models import GamificationEvent
from .serializer import RegisterSerializer, UserSerializer
from .permissions import HasAcceptedLGPD
from .models import Company
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import update_last_login

User = get_user_model()

# Create your views here.

class CompanyCreateView(APIView):
    def post(self, request):
        name = request.data.get('name')
        if not name:
            return Response({'error': 'Nome é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
        
        company, created = Company.objects.get_or_create(name=name)
        return Response({
            'id': company.id,
            'name': company.name
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            # Login streak
            hoje = timezone.now().date()
            ultimo_login = user.last_login.date() if user.last_login else None
            
            if ultimo_login is None or ultimo_login < hoje - timedelta(days=1):
                user.login_streak = 1
            elif ultimo_login == hoje - timedelta(days=1):
                user.login_streak += 1
            # se já logou hoje, não muda nada

            # Gamificação — 5 pontos por login diário
            if ultimo_login != hoje and user.role == 'employee':
                update_last_login(None, user)
                user.total_points += 5
                GamificationEvent.objects.create(
                    user=user,
                    event_type='daily_login',
                    points=5
                )

            user.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
    
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
        
class EmployeeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'psychologist':
            return Response({'error': 'Acesso negado'}, status=403)
        employees = User.objects.filter(
            company=request.user.company,
            role='employee'
        ).values('id', 'first_name', 'last_name', 'username')
        return Response(list(employees))
    
class PsychologistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            psychologist = User.objects.get(
                company=request.user.company,
                role='psychologist'
            )
            return Response({
                'id': str(psychologist.id),
                'first_name': psychologist.first_name,
                'last_name': psychologist.last_name,
            })
        except User.DoesNotExist:
            return Response({'error': 'Nenhum psicólogo encontrado'}, status=404)