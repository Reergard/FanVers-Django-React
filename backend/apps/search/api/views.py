from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics

from apps.catalog.models import Book
from apps.catalog.api.serializers import BookSerializer
from apps.search.filters import BookFilter


class BookSearchView(generics.ListAPIView):
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = BookFilter

    def get_queryset(self):
        queryset = Book.objects.annotate(chapter_count=Count('chapters'))
        queryset = self.filter_queryset(queryset)
        return queryset

