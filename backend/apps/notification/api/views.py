from rest_framework import viewsets
from rest_framework.response import Response
from ..models import Notification
from .serializers import NotificationSerializer
import time
from django.db import transaction

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        try:
            base_queryset = Notification.objects.filter(
                user=self.request.user
            ).select_related(
                'book', 
                'error_report', 
                'error_report__user'
            )

            queryset = base_queryset.order_by('-created_at')
            
            return queryset
            
        except Exception:
            return Notification.objects.none()

    @transaction.atomic
    def list(self, request, *args, **kwargs):
        try:
            current_version = request.query_params.get('version', '0')
            request_id = request.headers.get('X-Request-ID', 'unknown')
            
            queryset = self.get_queryset()
            
            if queryset.exists():
                new_version = int(queryset.first().created_at.timestamp() * 1000)
            else:
                new_version = int(time.time() * 1000)
                
            try:
                current_version_int = int(float(current_version))
            except (ValueError, TypeError):
                current_version_int = 0
                
            if current_version_int == new_version:
                return Response({
                    'notifications': [],
                    'version': new_version
                })

            serializer = self.get_serializer(queryset, many=True)
            
            unique_data = {item['id']: item for item in serializer.data}.values()
            
            return Response({
                'notifications': list(unique_data),
                'version': new_version
            })
            
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'detail': str(e)
            }, status=500)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        try:
            notification = self.get_object()
            if notification.user != request.user:
                return Response(
                    {'error': 'У вас немає прав для видалення цього повідомлення'}, 
                    status=403
                )
            
            notification.delete()
            return Response(status=204)
            
        except Exception as e:
            return Response(
                {'error': 'Помилка при видаленні повідомлення', 'detail': str(e)}, 
                status=500
            )