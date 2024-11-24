from django.db import models
from apps.users.models import User
from apps.catalog.models import Book, Chapter




class BaseComment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='%(class)s_likes', blank=True)
    dislikes = models.ManyToManyField(User, related_name='%(class)s_dislikes', blank=True)

    class Meta:
        abstract = True

    def get_likes_count(self):
        return self.likes.count()

    def get_dislikes_count(self):
        return self.dislikes.count()

class BookComment(BaseComment):
    book = models.ForeignKey(Book, related_name='comments', on_delete=models.CASCADE)

class ChapterComment(BaseComment):
    chapter = models.ForeignKey(Chapter, related_name='comments', on_delete=models.CASCADE)
