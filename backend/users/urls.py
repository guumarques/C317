from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CompanyCreateView, EmployeeListView, PsychologistView, RegisterView, LoginView, LogoutView, MeView, AcceptLGPDView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('accept-lgpd/', AcceptLGPDView.as_view(), name='accept_lgpd'),
    path('companies/', CompanyCreateView.as_view()),
    path('employees/', EmployeeListView.as_view()),
    path('psychologist/', PsychologistView.as_view()),
]