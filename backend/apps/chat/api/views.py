from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from ..models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            raise AuthenticationFailed('User not authenticated')
        return Chat.objects.filter(participants=self.request.user)

    def list(self, request, *args, **kwargs):
        print("List method called")
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def create_chat(self, request):
        if not request.user.is_authenticated:
            raise AuthenticationFailed('User not authenticated')
            
        print(f"Create chat request from user: {request.user}")
        print(f"Request data: {request.data}")
        
        username = request.data.get('username')
        message = request.data.get('message')
        
        try:
            other_user = User.objects.get(username=username)
            print(f"Found other user: {other_user}")
            
            # Створюємо новий чат
            chat = Chat.objects.create()
            chat.participants.add(request.user, other_user)
            
            # Створюємо перше повідомлення, якщо воно є
            if message:
                Message.objects.create(
                    chat=chat,
                    sender=request.user,
                    content=message
                )
            
            print(f"Created chat: {chat}")
            return Response(
                self.serializer_class(chat).data,
                status=status.HTTP_201_CREATED
            )
        except User.DoesNotExist:
            print(f"User not found: {username}")
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error creating chat: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        chat = self.get_object()
        messages = chat.messages.all()
        return Response(MessageSerializer(messages, many=True).data)

    def destroy(self, request, *args, **kwargs):
        chat = self.get_object()
        chat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)