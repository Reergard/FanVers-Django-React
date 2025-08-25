import json
import traceback
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Chat, Message
from django.utils import timezone
from channels.auth import AuthMiddlewareStack
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from channels.middleware import BaseMiddleware

User = get_user_model()

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        print(f"🔐 [TokenAuthMiddleware] === START ===")
        print(f"🔐 [TokenAuthMiddleware] Scope type: {scope.get('type')}")
        print(f"🔐 [TokenAuthMiddleware] Scope path: {scope.get('path')}")
        print(f"🔐 [TokenAuthMiddleware] Scope query_string: {scope.get('query_string')}")
        print(f"🔐 [TokenAuthMiddleware] Scope headers: {scope.get('headers')}")
        
        try:
            query_string = scope["query_string"].decode()
            print(f"🔐 [TokenAuthMiddleware] Decoded query_string: {query_string}")
            
            token = dict(x.split('=') for x in query_string.split('&')).get('token', None)
            print(f"🔐 [TokenAuthMiddleware] Extracted token: {token[:20] if token else 'None'}...")
            
            if token:
                print(f"🔐 [TokenAuthMiddleware] Validating token...")
                access_token = AccessToken(token)
                print(f"🔐 [TokenAuthMiddleware] Token payload: {access_token.payload}")
                
                user = await database_sync_to_async(get_user_model().objects.get)(id=access_token["user_id"])
                print(f"🔐 [TokenAuthMiddleware] Found user: {user.username} (ID: {user.id})")
                scope["user"] = user
            else:
                print(f"🔐 [TokenAuthMiddleware] No token found, setting user to None")
                scope["user"] = None
                
            print(f"🔐 [TokenAuthMiddleware] Final scope user: {scope['user']}")
            print(f"🔐 [TokenAuthMiddleware] === END ===")
            
        except Exception as e:
            print(f"🔐 [TokenAuthMiddleware] ERROR: {e}")
            print(f"🔐 [TokenAuthMiddleware] Traceback: {traceback.format_exc()}")
            scope["user"] = None
            
        return await super().__call__(scope, receive, send)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print(f"🔌 [ChatConsumer] === CONNECT START ===")
        print(f"🔌 [ChatConsumer] Time: {timezone.now()}")
        print(f"🔌 [ChatConsumer] Consumer instance: {self}")
        print(f"🔌 [ChatConsumer] Scope type: {self.scope.get('type')}")
        print(f"🔌 [ChatConsumer] Scope path: {self.scope.get('path')}")
        print(f"🔌 [ChatConsumer] Scope user: {self.scope.get('user')}")
        print(f"🔌 [ChatConsumer] Scope keys: {list(self.scope.keys())}")
        print(f"🔌 [ChatConsumer] Channel name: {getattr(self, 'channel_name', 'NOT_SET')}")
        
        try:
            if self.scope["user"].is_anonymous:
                print(f"🔌 [ChatConsumer] ❌ Anonymous user, closing connection")
                await self.close()
                return

            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f'chat_{self.room_name}'
            
            print(f"🔌 [ChatConsumer] Room name: {self.room_name}")
            print(f"🔌 [ChatConsumer] Room group name: {self.room_group_name}")
            print(f"🔌 [ChatConsumer] User {self.scope['user'].username} trying to connect to chat {self.room_name}")

            chat_exists = await self.check_chat_access()
            print(f"🔌 [ChatConsumer] Chat access check result: {chat_exists}")
            
            if not chat_exists:
                print(f"🔌 [ChatConsumer] ❌ Chat access denied, closing connection")
                await self.close()
                return

            print(f"🔌 [ChatConsumer] Adding to channel layer: {self.room_group_name}")
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            print(f"🔌 [ChatConsumer] Accepting connection...")
            await self.accept()
            print(f"🔌 [ChatConsumer] ✅ === CONNECT SUCCESS: {self.room_group_name} ===")
            print(f"🔌 [ChatConsumer] Final channel name: {self.channel_name}")
            print(f"🔌 [ChatConsumer] Final room group: {self.room_group_name}")
            
        except Exception as e:
            print(f"🔌 [ChatConsumer] ❌ === CONNECT ERROR: {e} ===")
            print(f"🔌 [ChatConsumer] Traceback: {traceback.format_exc()}")
            await self.close()

    async def disconnect(self, close_code):
        print(f"🔌 [ChatConsumer] === DISCONNECT START ===")
        print(f"🔌 [ChatConsumer] Time: {timezone.now()}")
        print(f"🔌 [ChatConsumer] Close code: {close_code}")
        print(f"🔌 [ChatConsumer] Close code meaning: {self.get_close_code_meaning(close_code)}")
        print(f"🔌 [ChatConsumer] Consumer instance: {self}")
        print(f"🔌 [ChatConsumer] Channel name: {getattr(self, 'channel_name', 'N/A')}")
        print(f"🔌 [ChatConsumer] Room group: {getattr(self, 'room_group_name', 'N/A')}")
        print(f"🔌 [ChatConsumer] Scope user: {self.scope.get('user')}")
        
        try:
            if hasattr(self, 'room_group_name'):
                print(f"🔌 [ChatConsumer] Removing from channel layer: {self.room_group_name}")
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
            print(f"🔌 [ChatConsumer] WebSocket disconnected: {close_code}")
            print(f"🔌 [ChatConsumer] === DISCONNECT COMPLETE ===")
        except Exception as e:
            print(f"🔌 [ChatConsumer] ❌ Error during disconnect: {e}")
            print(f"🔌 [ChatConsumer] Traceback: {traceback.format_exc()}")

    def get_close_code_meaning(self, close_code):
        meanings = {
            1000: "Normal Closure",
            1001: "Going Away",
            1002: "Protocol Error",
            1003: "Unsupported Data",
            1004: "Reserved",
            1005: "No Status Received",
            1006: "Abnormal Closure",
            1007: "Invalid frame payload data",
            1008: "Policy Violation",
            1009: "Message too big",
            1010: "Client wants extension",
            1011: "Server error",
            1012: "Service restart",
            1013: "Try again later",
            1014: "Bad gateway",
            1015: "TLS handshake",
            None: "Client initiated close"
        }
        return meanings.get(close_code, f"Unknown code: {close_code}")

    @database_sync_to_async
    def check_chat_access(self):
        print(f"🔌 [ChatConsumer] === CHECK_CHAT_ACCESS START ===")
        print(f"🔌 [ChatConsumer] Time: {timezone.now()}")
        print(f"🔌 [ChatConsumer] User ID: {self.scope['user'].id}")
        print(f"🔌 [ChatConsumer] Room name: {self.room_name}")
        
        try:
            print(f"🔌 [ChatConsumer] Querying database for chat {self.room_name}...")
            chat = Chat.objects.get(id=self.room_name)
            print(f"🔌 [ChatConsumer] ✅ Found chat: {chat}")
            print(f"🔌 [ChatConsumer] Chat participants: {[p.id for p in chat.participants.all()]}")
            
            user_has_access = chat.participants.filter(id=self.scope["user"].id).exists()
            print(f"🔌 [ChatConsumer] User access check: {user_has_access}")
            print(f"🔌 [ChatConsumer] === CHECK_CHAT_ACCESS END ===")
            return user_has_access
            
        except Chat.DoesNotExist:
            print(f"🔌 [ChatConsumer] ❌ Chat {self.room_name} not found!")
            print(f"🔌 [ChatConsumer] === CHECK_CHAT_ACCESS END ===")
            return False
        except Exception as e:
            print(f"🔌 [ChatConsumer] ❌ Error checking chat access: {e}")
            print(f"🔌 [ChatConsumer] Traceback: {traceback.format_exc()}")
            print(f"🔌 [ChatConsumer] === CHECK_CHAT_ACCESS END ===")
            return False

    async def receive(self, text_data):
        print(f"📨 [ChatConsumer] === RECEIVE START ===")
        print(f"📨 [ChatConsumer] Time: {timezone.now()}")
        print(f"📨 [ChatConsumer] Text data: {text_data}")
        print(f"📨 [ChatConsumer] Channel name: {self.channel_name}")
        print(f"📨 [ChatConsumer] Room group: {self.room_group_name}")
        
        try:
            text_data_json = json.loads(text_data)
            print(f"📨 [ChatConsumer] Parsed JSON: {text_data_json}")
            
            message = text_data_json['message']
            print(f"📨 [ChatConsumer] Message content: {message}")
            
            print(f"📨 [ChatConsumer] Saving message to database...")
            saved_message = await self.save_message(message)
            print(f"📨 [ChatConsumer] ✅ Message saved: {saved_message.id}")

            print(f"📨 [ChatConsumer] Broadcasting to group {self.room_group_name}...")
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
            print(f"📨 [ChatConsumer] ✅ Message broadcasted")
            print(f"📨 [ChatConsumer] === RECEIVE END ===")
            
        except Exception as e:
            print(f"📨 [ChatConsumer] ❌ Error in receive: {e}")
            print(f"📨 [ChatConsumer] Traceback: {traceback.format_exc()}")
            print(f"📨 [ChatConsumer] === RECEIVE END ===")

    async def chat_message(self, event):
        print(f"📨 [ChatConsumer] === CHAT_MESSAGE START ===")
        print(f"📨 [ChatConsumer] Time: {timezone.now()}")
        print(f"📨 [ChatConsumer] Event: {event}")
        print(f"📨 [ChatConsumer] Channel name: {self.channel_name}")
        
        message_data = {
            'id': event.get('id'),
            'message': event['message'],
            'sender': {
                'username': event['sender']
            },
            'timestamp': event['timestamp']
        }
        print(f"📨 [ChatConsumer] Formatted message data: {message_data}")
        
        print(f"📨 [ChatConsumer] Sending to WebSocket client...")
        await self.send(text_data=json.dumps(message_data))
        print(f"📨 [ChatConsumer] ✅ Message sent to client")
        print(f"📨 [ChatConsumer] === CHAT_MESSAGE END ===")

    @database_sync_to_async
    def save_message(self, message):
        print(f"💾 [ChatConsumer] === SAVE_MESSAGE START ===")
        print(f"💾 [ChatConsumer] Time: {timezone.now()}")
        print(f"💾 [ChatConsumer] Message: {message}")
        print(f"💾 [ChatConsumer] Room name: {self.room_name}")
        print(f"💾 [ChatConsumer] User: {self.scope['user'].username}")
        
        try:
            chat = Chat.objects.get(id=self.room_name)
            print(f"💾 [ChatConsumer] Found chat: {chat}")
            
            saved_message = Message.objects.create(
                chat=chat,
                sender=self.scope["user"],
                content=message
            )
            print(f"💾 [ChatConsumer] ✅ Message saved with ID: {saved_message.id}")
            print(f"💾 [ChatConsumer] === SAVE_MESSAGE END ===")
            return saved_message
            
        except Exception as e:
            print(f"💾 [ChatConsumer] ❌ Error saving message: {e}")
            print(f"💾 [ChatConsumer] Traceback: {traceback.format_exc()}")
            print(f"💾 [ChatConsumer] === SAVE_MESSAGE END ===")
            raise