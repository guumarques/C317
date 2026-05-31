from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg
from django.utils import timezone
from datetime import timedelta
from questionnaires.models import Questionnaires
from users.models import User

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['manager', 'admin']:
            return Response({'error': 'Acesso negado'}, status=403)

        company = request.user.company
        users = User.objects.filter(company=company, role='employee')
        questionnaires = Questionnaires.objects.filter(user__in=users)

        averages = questionnaires.aggregate(
            avg_stress=Avg('stress_score'),
            avg_anxiety=Avg('anxiety_score'),
            avg_burnout=Avg('burnout_score'),
            avg_depression=Avg('depression_score'),
        )

        return Response({
            'total_employees': users.count(),
            'total_questionnaires': questionnaires.count(),
            'averages': averages
        })


class DashboardEvolutionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['manager', 'admin', 'psychologist']:
            return Response({'error': 'Acesso negado'}, status=403)

        company = request.user.company
        users = User.objects.filter(company=company, role='employee')

        hoje = timezone.now().date()
        semana_passada = hoje - timedelta(days=7)
        mes_passado = hoje - timedelta(days=30)

        def get_averages(queryset):
            return queryset.aggregate(
                avg_stress=Avg('stress_score'),
                avg_anxiety=Avg('anxiety_score'),
                avg_burnout=Avg('burnout_score'),
                avg_depression=Avg('depression_score'),
            )

        esta_semana = get_averages(
            Questionnaires.objects.filter(user__in=users, answered_at__date__gte=semana_passada)
        )
        semana_anterior = get_averages(
            Questionnaires.objects.filter(
                user__in=users,
                answered_at__date__gte=semana_passada - timedelta(days=7),
                answered_at__date__lt=semana_passada
            )
        )
        este_mes = get_averages(
            Questionnaires.objects.filter(user__in=users, answered_at__date__gte=mes_passado)
        )
        mes_anterior = get_averages(
            Questionnaires.objects.filter(
                user__in=users,
                answered_at__date__gte=mes_passado - timedelta(days=30),
                answered_at__date__lt=mes_passado
            )
        )

        return Response({
            'semana': {
                'atual': esta_semana,
                'anterior': semana_anterior
            },
            'mes': {
                'atual': este_mes,
                'anterior': mes_anterior
            }
        })


class DashboardChatStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['manager', 'admin']:
            return Response({'error': 'Acesso negado'}, status=403)

        from chat.models import ChatSession, ChatMessage
        company = request.user.company
        users = User.objects.filter(company=company, role='employee')

        total_sessions = ChatSession.objects.filter(user__in=users).count()
        total_messages = ChatMessage.objects.filter(session__user__in=users).count()

        return Response({
            'total_sessions': total_sessions,
            'total_messages': total_messages,
        })