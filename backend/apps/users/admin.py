from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Profile, User
from .forms import CustomUserChangeForm, CustomUserCreationForm
from django.urls import reverse
from django.contrib.auth.models import Group
from django import forms


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    ordering = ["username"]
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm

    list_display = ["email", "username", "created", "is_active", "get_user_group"]
    list_display_links = ["email"]
    list_filter = ["is_active", "groups"]
    search_fields = ["email", "username"]

    def get_user_group(self, obj):
        groups = obj.groups.all()
        return 'Перекладач' if groups.filter(name='Перекладач').exists() else 'Читач'
    get_user_group.short_description = 'Роль'

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
    list_display = ('username', 'email', 'created', 'image', 'get_owned_books_count', 'role')
    search_fields = ('username', 'email')
    list_filter = ('role',)
    
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
        ('Роль користувача', {
            'fields': ('role',),
            'description': 'Оберіть роль користувача'
        }),
        ('Книги користувача', {
            'fields': ('get_owned_books_list',),
        }),
        ('Системна інформація', {
            'fields': ('created', 'token', 'is_default'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if 'role' in form.changed_data:  # Если роль была изменена
            obj.user.groups.clear()
            group, _ = Group.objects.get_or_create(name=form.cleaned_data['role'])
            obj.user.groups.add(group)
        super().save_model(request, obj, form, change)

