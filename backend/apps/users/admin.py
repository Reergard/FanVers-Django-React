from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Profile, User
from .forms import CustomUserChangeForm, CustomUserCreationForm
from django.urls import reverse


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
    list_display = ('username', 'email', 'created', 'image', 'get_owned_books_count')
    search_fields = ('username', 'email')
    
    def get_owned_books_count(self, obj):
        return obj.user.owned_books.count()
    get_owned_books_count.short_description = 'Кількість книг'

    def get_owned_books_list(self, obj):
        books = obj.user.owned_books.all()
        return '\n'.join([f"{book.title}" for book in books])
    get_owned_books_list.short_description = 'Книги користувача'

    readonly_fields = ('get_owned_books_list', 'created')
    
    fieldsets = (
        ('Основна інформація', {
            'fields': ('user', 'username', 'email', 'about', 'image', 'balance')
        }),
        ('Книги користувача', {
            'fields': ('get_owned_books_list',),
        }),
        ('Системна інформація', {
            'fields': ('created', 'token', 'is_default'),
            'classes': ('collapse',)
        }),
    )
