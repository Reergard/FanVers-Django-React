import os
import django

# Сначала устанавливаем переменную окружения
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FanVers_project.settings')
django.setup()

# Затем импортируем все остальное
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from apps.chat.consumers import TokenAuthMiddleware
from apps.chat.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        TokenAuthMiddleware(
            AuthMiddlewareStack(
                URLRouter(
                    websocket_urlpatterns
                )
            )
        )
    ),
})

if __name__ == "__main__":
    from daphne.server import Server
    import sys
    
    port = 8000
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
        
    print(f"Starting Daphne server on port {port}...")
    
    server = Server(
        application=application,
        endpoints=['tcp:port=' + str(port) + ':interface=127.0.0.1']
    )
    server.run() 