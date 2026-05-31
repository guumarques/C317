from rest_framework.permissions import BasePermission

class HasAcceptedLGPD(BasePermission):
    message = 'É necessário aceitar os termos da LGPD para acessar este recurso.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.lgpd_consent
        )

ROLE_LABELS = {
    'employee': 'Funcionário',
    'psychologist': 'Psicólogo',
    'manager': 'Gestor',
}

class _HasRole(BasePermission):
    """Classe base interna para permissões por cargo."""
    allowed_roles = []

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in self.allowed_roles
        )

    @property
    def message(self):
        roles = [
            ROLE_LABELS.get(role, role)
            for role in self.allowed_roles
        ]

        return f"Somente esses cargos podem acessar esse recurso: {', '.join(roles)}."
    
class IsEmployee(_HasRole):
    allowed_roles = ['employee']

class IsPsychologist(_HasRole):
    allowed_roles = ['psychologist']

class IsManager(_HasRole):
    allowed_roles = ['manager']

class IsEmployeeOrPsychologist(_HasRole):
    allowed_roles = ['employee', 'psychologist']

class IsPsychologistOrManager(_HasRole):
    allowed_roles = ['psychologist', 'manager']
