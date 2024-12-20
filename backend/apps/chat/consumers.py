import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Chat, Message
from django.utils import timezone

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
            return

        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Перевіряємо доступ до чату
        chat_exists = await self.check_chat_access()
        if not chat_exists:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

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
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        
        # Зберігаємо повідомлення в базу даних
        saved_message = await self.save_message(message)

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