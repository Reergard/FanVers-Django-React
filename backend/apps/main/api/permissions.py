from rest_framework.permissions import BasePermission


# class IsClientUser(BasePermission):
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.client_id is not None
