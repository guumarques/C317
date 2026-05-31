from django.urls import path
from .views import InsightCreateView, InsightHistoryView

urlpatterns = [
    path('', InsightCreateView.as_view()),
    path('history/', InsightHistoryView.as_view()),
]