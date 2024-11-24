from django.contrib import admin
from .models import Book, Tag, Fandom, Country, Genres, TagGroups, Chapter, Volume

import logging

logger = logging.getLogger(__name__)


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):

    list_display = ['title', 'title_en', 'author', 'get_creator', 'get_owner', 'get_tags', 'get_fandoms', 'get_country', 'get_genres']
    list_filter = ['author', 'creator', 'owner', 'tags', 'fandoms', 'country', 'genres']
    search_fields = ['title', 'author', 'creator__username', 'owner__username']

    def get_creator(self, obj):
        return obj.creator.username if obj.creator else 'Не указан'
    get_creator.short_description = 'Создатель'

    def get_owner(self, obj):
        return obj.owner.username if obj.owner else 'Не указан'
    get_owner.short_description = 'Владелец'

    def get_tags(self, obj):
        return ", ".join([tag.name for tag in obj.tags.all()])

    def get_genres(self, obj):
        return ", ".join([genres.name for genres in obj.genres.all()])

    def get_fandoms(self, obj):
        return ", ".join([fandom.name for fandom in obj.fandoms.all()])

    def get_country(self, obj):
        return obj.country.name if obj.country else 'Не указана'
    get_country.short_description = 'Страна'

    def get_chapter(self, obj):
        return ",".join([chapter.title for chapter in obj.chapters.all()])


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ['title']
    search_fields = ['title']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_tags']
    search_fields = [all]

    def get_tags(self, obj):
        return obj.group.name


@admin.register(TagGroups)
class TagGroupsAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Fandom)
class FandomAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Genres)
class GenresAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Volume)
class VolumeAdmin(admin.ModelAdmin):
    list_display = ['title', 'book', 'created_at']
    list_filter = ['book']
    search_fields = ['title', 'book__title']
    ordering = ['created_at']

