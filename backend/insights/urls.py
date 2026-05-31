from django.urls import path
from .views import InsightCreateView, InsightHistoryView, InsightReadView, InsightUpdateView

urlpatterns = [
    path('', InsightCreateView.as_view()),
    path('history/', InsightHistoryView.as_view()),
    path('<uuid:pk>/read', InsightReadView.as_view()),
    path('<uuid:pk>/update', InsightUpdateView.as_view()),
]