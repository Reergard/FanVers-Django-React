from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import Profile, User


class CustomUserCreationForm(UserCreationForm):
    password1 = forms.CharField(label='Пароль', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Підтвердження пароля', widget=forms.PasswordInput)

    class Meta(UserCreationForm):
        model = User
        fields = ["email", "username"]
        error_class = "error"

    def __init__(self, *args, **kwargs):
        super(CustomUserCreationForm, self).__init__(*args, **kwargs)
        for name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-control input-box form-ensurance-header-control'})


class CustomUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm):
        model = User
        fields = ["email", "username"]
        error_class = "error"
        password1 = forms.CharField(label='Пароль', widget=forms.PasswordInput)
        password2 = forms.CharField(label='Підтвердження пароля', widget=forms.PasswordInput)

    def __init__(self, *args, **kwargs):
        super(CustomUserChangeForm, self).__init__(*args, **kwargs)
        for name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-control input-box form-ensurance-header-control'})


class LoginForm(forms.Form):
    username = forms.CharField(label='Логін')
    password = forms.CharField(label='Пароль', widget=forms.PasswordInput)

    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)
        for name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-control input-box form-ensurance-header-control'})


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['username', 'email', 'about', 'image']
        labels = {
            'username': 'Логін',
            'email': 'Email',
            'about': 'Детально про себе',
            'image': 'Змінити фото профілю',
        }
        widgets = {
            'image': forms.FileInput(),
        }

    def __init__(self, *args, **kwargs):
        super(ProfileForm, self).__init__(*args, **kwargs)
        for name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-control input-box form-ensurance-header-control'})