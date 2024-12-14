from rest_framework.throttling import UserRateThrottle

class ProfileThrottle(UserRateThrottle):
    rate = '100/day'  # Ограничение на просмотр профиля - 100 запросов в день

class BalanceOperationThrottle(UserRateThrottle):
    rate = '10/hour'  # Ограничение на операции с балансом - 10 в час 

class PurchaseThrottle(UserRateThrottle):
    rate = '30/minute'  # Разрешаем 30 покупок в минуту