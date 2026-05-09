from django.urls import path
from .views import QuestionnaireCreateView, QuestionnaireHistoryView

urlpatterns = [
    path('', QuestionnaireCreateView.as_view()),
    path('history/', QuestionnaireHistoryView.as_view()),
]