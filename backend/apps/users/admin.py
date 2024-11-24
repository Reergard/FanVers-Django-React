from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Profile, User
from .forms import CustomUserChangeForm, CustomUserCreationForm


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    ordering = ["username"]
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm

    list_display = ["email", "username", "created", "is_active"]
    list_display_links = ["email"]
    list_filter = ["is_active"]
    search_fields = ["email", "username"]

    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'user_permissions', 'groups')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )

    filter_horizontal = ('user_permissions', 'groups')


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'created', 'image')
