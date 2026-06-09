from django.urls import path
from .views import ConsultationListCreateView, ConsultationDeleteView

urlpatterns = [
    path('', ConsultationListCreateView.as_view()),
    path('<uuid:pk>/', ConsultationDeleteView.as_view()),
]