from django.urls import path
from .views import QuestionnaireAllView, QuestionnaireCreateView, QuestionnaireHistoryView, QuestionnaireLatestView

urlpatterns = [
    path('', QuestionnaireCreateView.as_view()),
    path('history/', QuestionnaireHistoryView.as_view()),
    path('all/', QuestionnaireAllView.as_view()),
    path('latest/', QuestionnaireLatestView.as_view()),
]