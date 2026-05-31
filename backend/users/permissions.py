from rest_framework.permissions import BasePermission


class HasAcceptedLGPD(BasePermission):
    message = 'É necessário aceitar os termos da LGPD para acessar este recurso.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.lgpd_consent
        )