# Script to check user in Django database
# This will help verify if user exists and is active

Write-Host "To check user in Django, run this Python command:" -ForegroundColor Cyan
Write-Host ""
Write-Host "python manage.py shell" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then in Django shell, run:" -ForegroundColor Cyan
Write-Host ""
Write-Host "from django.contrib.auth import get_user_model" -ForegroundColor Green
Write-Host "User = get_user_model()" -ForegroundColor Green
Write-Host "user = User.objects.filter(username='Reergard').first()" -ForegroundColor Green
Write-Host "if user:" -ForegroundColor Green
Write-Host "    print(f'User found: {user.username}')" -ForegroundColor Green
Write-Host "    print(f'Is active: {user.is_active}')" -ForegroundColor Green
Write-Host "    print(f'Is staff: {user.is_staff}')" -ForegroundColor Green
Write-Host "    print(f'Is superuser: {user.is_superuser}')" -ForegroundColor Green
Write-Host "    print(f'Email: {user.email}')" -ForegroundColor Green
Write-Host "    # Test password" -ForegroundColor Green
Write-Host "    if user.check_password('NetworkKorp'):" -ForegroundColor Green
Write-Host "        print('Password is CORRECT')" -ForegroundColor Green
Write-Host "    else:" -ForegroundColor Green
Write-Host "        print('Password is INCORRECT')" -ForegroundColor Green
Write-Host "else:" -ForegroundColor Green
Write-Host "    print('User not found')" -ForegroundColor Green
Write-Host ""

