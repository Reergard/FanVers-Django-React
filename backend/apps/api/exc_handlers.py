from rest_framework.views import exception_handler
from rest_framework.exceptions import Throttled
import logging

logger = logging.getLogger(__name__)

def drf_exception_handler(exc, context):
    """
    Кастомный обработчик исключений для DRF
    Добавляет детальную информацию для 429 ошибок
    """
    response = exception_handler(exc, context)
    
    if isinstance(exc, Throttled) and response is not None:
        view = context.get("view")
        scope = getattr(view, "throttle_scope", None)
        
        # Детальная информация для фронтенда
        response.data = {
            "detail": response.data.get("detail", "Request was throttled."),
            "scope": scope,
            "available_in_sec": exc.wait,   # секунды до повтора
            "error_type": "throttled"
        }
        
        # Добавляем заголовки для фронтенда
        if exc.wait:
            response["X-RateLimit-Reset"] = str(exc.wait)
            response["Retry-After"] = str(exc.wait)
        
        logger.warning(f"Request throttled: scope={scope}, wait={exc.wait}s, view={view.__class__.__name__}")
    
    return response
