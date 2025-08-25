#!/usr/bin/env python3
"""
Скрипт для исправления оставшихся проблем с кавычками в конкретных файлах
"""

import os

def fix_instance_js():
    """Исправляет проблемы в instance.js"""
    file_path = "frontend/src/api/instance.js"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Исправляем все оставшиеся проблемы
    content = content.replace("'Network Error\\'", "'Network Error'")
    content = content.replace("'token\\'", "'token'")
    content = content.replace("'refresh\\'", "'refresh'")
    content = content.replace("'user\\'", "'user'")
    content = content.replace("'Content-Type\\'", "'Content-Type'")
    content = content.replace("'content-type\\'", "'content-type'")
    content = content.replace("'ERR_NETWORK\\'", "'ERR_NETWORK'")
    content = content.replace("'Network Error\\'", "'Network Error'")
    content = content.replace("'No access in refresh response\\'", "'No access in refresh response'")
    content = content.replace("'❌ Refresh не повернув новий токен, logout\\'", "'❌ Refresh не повернув новий токен, logout'")
    content = content.replace("'❌ Refresh токена не вдався:", "'❌ Refresh токена не вдався:")
    content = content.replace("'❌ Немає нового токена після refresh, logout\\'", "'❌ Немає нового токена після refresh, logout'")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Исправлен instance.js")

def fix_auth_service():
    """Исправляет проблемы в authService.js"""
    file_path = "frontend/src/auth/authService.js"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Исправляем проблемы
    content = content.replace("'../api/instance\\'", "'../api/instance'")
    content = content.replace("'./tokenService\\'", "'./tokenService'")
    content = content.replace("'/auth/users/\\'", "'/auth/users/'")
    content = content.replace("'/auth/jwt/create/\\'", "'/auth/jwt/create/'")
    content = content.replace("'token\\'", "'token'")
    content = content.replace("'refresh\\'", "'refresh'")
    content = content.replace("'/auth/users/activation/\\'", "'/auth/users/activation/'")
    content = content.replace("'/auth/users/reset_password/\\'", "'/auth/users/reset_password/'")
    content = content.replace("'/auth/users/reset_password_confirm/\\'", "'/auth/users/reset_password_confirm/'")
    content = content.replace("'/users/profile/\\'", "'/users/profile/'")
    content = content.replace("'authService.getProfile error:", "'authService.getProfile error:")
    content = content.replace("'ERR_NETWORK\\'", "'ERR_NETWORK'")
    content = content.replace("'Network Error\\'", "'Network Error'")
    content = content.replace("'🌐 Помилка з'єднання з сервером в authService.getProfile\\'", "'🌐 Помилка з\'єднання з сервером в authService.getProfile'")
    content = content.replace("'Помилка з'єднання з сервером\\'", "'Помилка з\'єднання з сервером'")
    content = content.replace("'/auth/users/me/\\'", "'/auth/users/me/'")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Исправлен authService.js")

def fix_users_api():
    """Исправляет проблемы в usersAPI.js"""
    file_path = "frontend/src/api/users/usersAPI.js"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Исправляем проблемы
    content = content.replace("'../instance\\'", "'../instance'")
    content = content.replace("'/users/profile/\\'", "'/users/profile/'")
    content = content.replace("'usersAPI.getProfile error:", "'usersAPI.getProfile error:")
    content = content.replace("'ERR_NETWORK\\'", "'ERR_NETWORK'")
    content = content.replace("'Network Error\\'", "'Network Error'")
    content = content.replace("'🌐 Помилка з'єднання з сервером в getProfile\\'", "'🌐 Помилка з\'єднання з сервером в getProfile'")
    content = content.replace("'Помилка з'єднання з сервером\\'", "'Помилка з\'єднання з сервером'")
    content = content.replace("'/users/translators/\\'", "'/users/translators/'")
    content = content.replace("'/users/update-balance/\\'", "'/users/update-balance/'")
    content = content.replace("'Сервіс тимчасово недоступний\\'", "'Сервіс тимчасово недоступний'")
    content = content.replace("'Купівля вже в процесі\\'", "'Купівля вже в процесі'")
    content = content.replace("'Будь ласка, зачекайте перед наступною спробою\\'", "'Будь ласка, зачекайте перед наступною спробою'")
    content = content.replace("'Занадто багато запитів. Будь ласка, зачекайте хвилину\\'", "'Занадто багато запитів. Будь ласка, зачекайте хвилину'")
    content = content.replace("'/users/become-translator/\\'", "'/users/become-translator/'")
    content = content.replace("'/users/add-balance/\\'", "'/users/add-balance/'")
    content = content.replace("'/users/withdraw-balance/\\'", "'/users/withdraw-balance/'")
    content = content.replace("'Error fetching user balance:", "'Error fetching user balance:")
    content = content.replace("'/users/profile/\\'", "'/users/profile/'")
    content = content.replace("'Error checking balance:", "'Error checking balance:")
    content = content.replace("'image\\'", "'image'")
    content = content.replace("'usersAPI.uploadProfileImage error:", "'usersAPI.uploadProfileImage error:")
    content = content.replace("'Занадто багато спроб завантаження. Спробуйте через годину.\\'", "'Занадто багато спроб завантаження. Спробуйте через годину.'")
    content = content.replace("'/users/profile/delete-image/\\'", "'/users/profile/delete-image/'")
    content = content.replace("'/users/profile/update-email/\\'", "'/users/profile/update-email/'")
    content = content.replace("'/users/profile/change-password/\\'", "'/users/profile/change-password/'")
    content = content.replace("'/users/profile/notification-settings/\\'", "'/users/profile/notification-settings/'")
    content = content.replace("'/navigation/bookmarks/\\'", "'/navigation/bookmarks/'")
    content = content.replace("'all\\'", "'all'")
    content = content.replace("'Error fetching user bookmarks:", "'Error fetching user bookmarks:")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Исправлен usersAPI.js")

def main():
    """Основная функция"""
    print("🔧 Исправляю оставшиеся проблемы с кавычками...")
    
    fix_instance_js()
    fix_auth_service()
    fix_users_api()
    
    print("🎉 Готово!")

if __name__ == "__main__":
    main()
