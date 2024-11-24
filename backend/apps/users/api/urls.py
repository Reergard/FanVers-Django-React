from django.urls import path
from . import views
from .views import UserProfileView

app_name = 'users'


urlpatterns = [
    # /api/users/...
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.update_profile_view, name='update_profile'),
    path('add-balance/', views.AddBalanceView.as_view(), name='add_balance'),
    path('purchase-chapter/<int:chapter_id>/', views.PurchaseChapterView.as_view(), name='purchase_chapter'),
]
