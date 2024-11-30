from django.urls import path
from . import views
from .views import UserProfileView

app_name = 'users'


urlpatterns = [
    # /api/users/...
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.update_profile_view, name='update_profile'),
    path('add-balance/', views.AddBalanceView.as_view(), name='add_balance'),
    path('purchase-chapter/<int:chapter_id>/', views.purchase_chapter, name='purchase_chapter'),
    path('update-balance/', views.update_balance, name='update-balance'),
    path('become-translator/', views.become_translator, name='become-translator'),
    path('deposit-balance/', views.deposit_balance, name='deposit-balance'),
    path('withdraw-balance/', views.withdraw_balance, name='withdraw-balance'),
]
