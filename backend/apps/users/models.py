import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager

from django.db.models.signals import post_save
from django.dispatch import receiver


def generate_token():
    return str(uuid.uuid4())


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(_("Логін"), max_length=20, unique=True)
    email = models.EmailField(_("Email"), max_length=254)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    token = models.CharField(max_length=255, default=generate_token)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    objects = CustomUserManager()

    class Meta:
        verbose_name = _("Користувач")
        verbose_name_plural = _("Користувачі")

    def __str__(self):
        return self.email


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(max_length=50, unique=True)
    about = models.TextField(blank=True, null=True)
    image = models.ImageField(null=True, blank=True, default='users/profile_images/no_image.jpg', upload_to='users/profile_images/')
    created = models.DateTimeField(auto_now_add=True)
    token = models.CharField(max_length=255, default=generate_token)
    is_default = models.BooleanField(default=False)
    balance = models.IntegerField(default=0)
    purchased_chapters = models.ManyToManyField('catalog.Chapter', blank=True, related_name='purchased_by')

    class Meta:
        verbose_name = 'Профіль'
        verbose_name_plural = 'Профілі'

    def __str__(self):
        if self.image:
            return f"Id:{self.id}, {self.user.username}, Image:{self.image.url}"
        else:
            return f"Id:{self.id}, {self.user.username}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(
            user=instance,
            username=instance.username,
            email=instance.email
        )


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
