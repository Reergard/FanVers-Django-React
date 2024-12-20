from rest_framework.throttling import UserRateThrottle

class ProfileThrottle(UserRateThrottle):
    rate = '100/day' # Обмеження на перегляд профілю - 100 запитів на день

class BalanceOperationThrottle(UserRateThrottle):
    rate = '10/hour' # Обмеження на операції з балансом - 10 на годину 

class PurchaseThrottle(UserRateThrottle):
    rate = '30/minute' # Дозволяємо 30 покупок на хвилину