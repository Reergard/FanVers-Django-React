import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Chat, Message
from django.utils import timezone
from channels.auth import AuthMiddlewareStack
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from channels.middleware import BaseMiddleware

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            if self.scope["user"].is_anonymous:
                await self.close()
                return

            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f'chat_{self.room_name}'

            # Проверяем доступ к чату
            chat_exists = await self.check_chat_access()
            if not chat_exists:
                await self.close()
                return

            # Добавляем в группу
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
            print(f"WebSocket connected: {self.room_group_name}")
            
        except Exception as e:
            print(f"WebSocket connection error: {e}")
            await self.close()

    async def disconnect(self, close_code):
        try:
            if hasattr(self, 'room_group_name'):
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
            print(f"WebSocket disconnected: {close_code}")
        except Exception as e:
            print(f"Error during disconnect: {e}")

    @database_sync_to_async
    def check_chat_access(self):
        try:
            chat = Chat.objects.get(id=self.room_name)
            return chat.participants.filter(id=self.scope["user"].id).exists()
        except Chat.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, message):
        chat = Chat.objects.get(id=self.room_name)
        return Message.objects.create(
            chat=chat,
            sender=self.scope["user"],
            content=message
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            
            # Сохраняем сообщение в базу данных
            saved_message = await self.save_message(message)

            # Отправляем сообщение в группу
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'id': saved_message.id,
                    'message': message,
                    'sender': self.scope["user"].username,
                    'timestamp': timezone.now().isoformat()
                }
            )
        except Exception as e:
            print(f"Error in receive: {e}")

    async def chat_message(self, event):
        message_data = {
            'id': event.get('id'),
            'message': event['message'],
            'sender': {
                'username': event['sender']
            },
            'timestamp': event['timestamp']
        }
        await self.send(text_data=json.dumps(message_data))

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        try:
            query_string = scope["query_string"].decode()
            token = dict(x.split('=') for x in query_string.split('&')).get('token', None)
            if token:
                access_token = AccessToken(token)
                user = await database_sync_to_async(get_user_model().objects.get)(id=access_token["user_id"])
                scope["user"] = user
            else:
                scope["user"] = None
        except Exception as e:
            print(f"WebSocket auth error: {e}")
            scope["user"] = None
        return await super().__call__(scope, receive, send)