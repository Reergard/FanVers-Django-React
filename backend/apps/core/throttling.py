from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class BaseUserRateThrottle(UserRateThrottle):
    rate = '2000/minute'  # Увеличено с 60/minute

class BaseAnonRateThrottle(AnonRateThrottle):
    rate = '1000/minute'  # Увеличено с 30/minute

class StrictUserRateThrottle(UserRateThrottle):
    rate = '500/minute'  # Увеличено с 30/minute

class StrictAnonRateThrottle(AnonRateThrottle):
    rate = '250/minute'  # Увеличено с 15/minute 