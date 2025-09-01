import django_filters

from apps.catalog.models import Book, Genres, Tag, Fandom, Country


class BookFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(field_name='title', lookup_expr='icontains')
    genres = django_filters.ModelMultipleChoiceFilter(
        field_name='genres',
        queryset=Genres.objects.all()
    )
    countries = django_filters.ModelMultipleChoiceFilter(
        field_name='country',
        queryset=Country.objects.all()
    )
    min_chapters = django_filters.NumberFilter(field_name='chapter_count', lookup_expr='gte')
    max_chapters = django_filters.NumberFilter(field_name='chapter_count', lookup_expr='lte')
    tags = django_filters.ModelMultipleChoiceFilter(
        field_name='tags',
        queryset=Tag.objects.all()
    )
    fandoms = django_filters.ModelMultipleChoiceFilter(
        field_name='fandoms',
        queryset=Fandom.objects.all()
    )
    exclude_genres = django_filters.ModelMultipleChoiceFilter(
        field_name='genres',
        queryset=Genres.objects.all(),
        exclude=True
    )
    exclude_fandoms = django_filters.ModelMultipleChoiceFilter(
        field_name='fandoms',
        queryset=Fandom.objects.all(),
        exclude=True
    )
    exclude_tags = django_filters.ModelMultipleChoiceFilter(
        field_name='tags',
        queryset=Tag.objects.all(),
        exclude=True
    )
    order = django_filters.OrderingFilter(
        fields=(
            ('title', 'title'),
            ('-last_updated', 'last_updated'),
            ('chapter_count', 'chapter_count'),
        )
    )

    adult_content = django_filters.BooleanFilter(method='filter_adult_content')

    class Meta:
        model = Book
        fields = [
            'title', 'genres', 'countries', 'min_chapters', 'max_chapters', 'tags', 'fandoms', 'adult_content',
            'exclude_genres', 'exclude_fandoms', 'exclude_tags', 'order'
        ]

    def filter_adult_content(self, queryset, name, value):
        if value:
            return queryset
        return queryset.filter(adult_content=False)
