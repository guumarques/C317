from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from users.models import User
from .models import Consultation
from .serializer import ConsultationSerializer


class ConsultationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'psychologist':
            return Response({'error': 'Acesso negado'}, status=403)
        consultations = Consultation.objects.filter(
            psychologist=request.user
        ).select_related('employee')
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'psychologist':
            return Response({'error': 'Acesso negado'}, status=403)

        # Valida que o funcionário é da mesma empresa
        try:
            employee = User.objects.get(
                id=request.data.get('employee_id'),
                company=request.user.company,
                role='employee'
            )
        except User.DoesNotExist:
            return Response({'error': 'Funcionário não encontrado'}, status=404)

        serializer = ConsultationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(psychologist=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=400)


class ConsultationDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != 'psychologist':
            return Response({'error': 'Acesso negado'}, status=403)
        consultation = get_object_or_404(Consultation, pk=pk, psychologist=request.user)
        consultation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)