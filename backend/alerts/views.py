from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from questionnaires.models import Questionnaires
from .models import Alerts
from users.models import User

class AlertView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['manager', 'psychologist']:
            return Response({'error': 'Acesso negado'}, status=status.HTTP_403_FORBIDDEN)

        # Verifica funcionários com scores altos
        funcionarios = User.objects.filter(
            company=request.user.company,
            role='employee'
        )

        alertas_gerados = []
        for funcionario in funcionarios:
            ultimos = Questionnaires.objects.filter(
                user=funcionario
            ).order_by('-answered_at')[:3]

            if len(ultimos) >= 1:
                media_burnout = sum(q.burnout_score for q in ultimos) / len(ultimos)
                media_depression = sum(q.depression_score for q in ultimos) / len(ultimos)

                if media_burnout >= 7 or media_depression >= 7:
                    alerta, created = Alerts.objects.get_or_create(
                        user=funcionario,
                        status='open',
                        defaults={
                            'type': 'burnout' if media_burnout >= 7 else 'depression',
                            'reason': f'Score médio elevado: burnout={media_burnout:.1f}, depressão={media_depression:.1f}'
                        }
                    )
                    alertas_gerados.append({
                        'usuario': funcionario.username,
                        'tipo': alerta.type,
                        'motivo': alerta.reason,
                        'data': alerta.triggered_at
                    })

        return Response(alertas_gerados)