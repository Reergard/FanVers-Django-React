from rest_framework.response import Response
from apps.catalog.models import Book, Chapter, Genres, Tag, Country, Fandom, Volume, ChapterOrder
from apps.catalog.api.serializers import (
    ChapterSerializer, GenresSerializer, TagSerializer,
    CountrySerializer, FandomSerializer, VolumeSerializer, ChapterOrderSerializer,
    BookOwnerSerializer, BookReaderSerializer
)
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR
from rest_framework import status
import os
import mammoth
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from apps.navigation.models import Bookmark
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from decimal import Decimal
from django.conf import settings
from django.utils.translation import gettext as _
from apps.catalog.utils.errorUtils import get_error_codes
from apps.catalog.api.permissions import IsBookOwner, IsNotBookOwner
from rest_framework import generics
from rest_framework import serializers


@api_view(['GET'])
def genres_list(request):
    genres = Genres.objects.all()
    serializer = GenresSerializer(genres, many=True)
    return Response(serializer.data, status=HTTP_200_OK)


@api_view(['GET'])
def tags_list(request):
    tags = Tag.objects.all()
    serializer = TagSerializer(tags, many=True)
    return Response(serializer.data, status=HTTP_200_OK)


@api_view(['GET'])
def countries_list(request):
    countries = Country.objects.all()
    serializer = CountrySerializer(countries, many=True)
    return Response(serializer.data, status=HTTP_200_OK)


@api_view(['GET'])
def fandoms_list(request):
    fandoms = Fandom.objects.all()
    serializer = FandomSerializer(fandoms, many=True)
    return Response(serializer.data, status=HTTP_200_OK)


@api_view(['GET', 'POST'])
def Catalog(request):
    permission_classes = [AllowAny]
    if request.method == 'GET':
        books = Book.objects.all()
        serializer = BookSerializer(books, many=True, context={'request': request})
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = BookSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=HTTP_200_OK)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def chapter_list(request, book_slug):
    try:
        book = Book.objects.get(slug=book_slug)
        chapters = Chapter.objects.filter(book=book).order_by('_position')
        
        serializer = ChapterSerializer(
            chapters,
            many=True,
            context={'request': request}
        )
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Book.DoesNotExist:
        return Response(
            {'error': 'Книга не знайдена'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error in chapter_list for book {book_slug}: {str(e)}")
        return Response(
            {'error': 'Помилка при отриманні списку глав'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def chapter_detail(request, book_slug, chapter_slug):
    try:
        chapter = Chapter.objects.select_related('book').get(
            book__slug=book_slug, 
            slug=chapter_slug
        )
        
        if chapter.is_paid and request.user.is_authenticated:
            is_purchased = request.user.profile.purchased_chapters.filter(id=chapter.id).exists()
            if not is_purchased:
                return Response(
                    {"error": "Необхідно придбати главу для перегляду"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        html_content = chapter.get_html_content()
        
        if html_content is None:
            if not chapter.file or not os.path.exists(chapter.file.path):
                return Response(
                    {"error": "Файл глави не знайдено"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
                
            try:
                with open(chapter.file.path, "rb") as docx_file:
                    result = mammoth.convert_to_html(docx_file)
                    html_content = result.value
                    chapter.save_html_content(html_content)
            except Exception as e:
                logger.error(f"Error converting chapter file: {str(e)}")
                return Response(
                    {"error": "Помилка при конвертації файлу глави"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        if not html_content:
            return Response(
                {"error": "Контент глави недоступний"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            'title': chapter.title,
            'content': html_content,
            'book_title': chapter.book.title,
            'book': chapter.book.id,
            'id': chapter.id,
            'book_id': chapter.book.id,
            'is_paid': chapter.is_paid,
            'price': float(chapter.price) if chapter.price else None
        })
        
    except Chapter.DoesNotExist:
        logger.error(f"Chapter not found: {book_slug}/{chapter_slug}")
        return Response(
            {"error": "Главу не знайдено"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error in chapter_detail: {book_slug}/{chapter_slug}: {str(e)}")
        return Response(
            {"error": "Виникла помилка при обробці глави"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated, IsBookOwner])
def add_chapter(request, slug):
    try:
        book = get_object_or_404(Book, slug=slug)
        
        if request.user != book.owner:
            return Response(
                {'error': 'У вас немає прав для додавання глав до цієї книги'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        volume_id = request.data.get('volume')
        is_paid = request.data.get('is_paid', '').lower() == 'true'
        
        try:
            price = Decimal(request.data.get('price', '1.00'))
        except (TypeError, ValueError):
            price = Decimal('1.00')
        
        if is_paid and (price <= 0 or price > 1000):
            return Response(
                {'error': 'Некоректна ціна глави'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if 'file' not in request.FILES:
            return Response(
                {'error': 'Файл глави обов\'язковий'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            chapter = Chapter.objects.create(
                book=book,
                title=request.data.get('title'),
                file=request.FILES['file'],
                volume_id=volume_id if volume_id else None,
                is_paid=is_paid,
                price=price
            )
            
            if chapter.file:
                try:
                    pass
                except Exception as e:
                    logger.error(f"Error processing HTML content: {str(e)}")
            
            serializer = ChapterSerializer(chapter)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating chapter: {str(e)}")
            return Response(
                {'error': 'Помилка при створенні глави'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f"Error in add_chapter view: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


def get_chapter_content(request, chapter_id):
    chapter = get_object_or_404(Chapter, id=chapter_id)
    with open(chapter.file.path, "rb") as docx_file:
        result = mammoth.convert_to_html(docx_file)
        html_content = result.value
    return JsonResponse({'content': html_content})


class BookOwnerViewSet(viewsets.ModelViewSet):
    serializer_class = BookOwnerSerializer
    lookup_field = 'slug'
    permission_classes = [IsAuthenticated, IsBookOwner]

    def get_queryset(self):
        return Book.objects.filter(owner=self.request.user)


class BookReaderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookReaderSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Book.objects.all().order_by('-last_updated')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.is_authenticated:
            bookmark = Bookmark.objects.filter(
                book=instance,
                user=request.user
            ).first()
            
            if bookmark:
                instance.bookmark_status = bookmark.status
                instance.bookmark_id = bookmark.id
            else:
                instance.bookmark_status = None
                instance.bookmark_id = None
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)





@api_view(['GET', 'POST'])
def volume_list(request, book_slug):
    book = get_object_or_404(Book, slug=book_slug)
    
    if request.method == 'GET':
        volumes = Volume.objects.filter(book=book)
        serializer = VolumeSerializer(volumes, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = VolumeSerializer(data={**request.data, 'book': book.id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_volume(request, book_slug):
    try:
        book = Book.objects.get(slug=book_slug)
        
        # Проверяем, является ли пользователь владельцем книги
        if request.user != book.owner:
            return Response(
                {'error': 'У вас немає прав для створення томів у цій книзі'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        if 'title' not in request.data:
            return Response(
                {'error': 'Назва тому обов\'язкова'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        volume = Volume.objects.create(
            book=book,
            title=request.data['title']
        )
        
        serializer = VolumeSerializer(volume)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Book.DoesNotExist:
        return Response(
            {'error': 'Книгу не знайдено'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_book(request):
    try:
        serializer = BookSerializer(data=request.data)
        
        if serializer.is_valid():
            book = serializer.save(
                creator=request.user,
                owner=request.user
            )
            
            if 'genres' in request.data:
                genres_ids = request.data.getlist('genres[]')
                book.genres.set(genres_ids)
            
            if 'tags' in request.data:
                tags_ids = request.data.getlist('tags[]')
                book.tags.set(tags_ids)
            
            if 'fandoms' in request.data:
                fandoms_ids = request.data.getlist('fandoms[]')
                book.fandoms.set(fandoms_ids)
            
            if 'image' in request.FILES:
                book.image = request.FILES['image']
                book.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            error_details = get_error_codes(serializer.errors)
            return Response(
                {'errors': error_details}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        return Response(
            {'errors': [{'field': 'non_field', 'code': 'server_error'}]},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def owned_books(request):
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Необхідна вторизація'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    books = Book.objects.filter(owner=request.user)
    serializer = BookSerializer(books, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_chapter(request, book_slug, chapter_id):
    try:
        chapter = get_object_or_404(Chapter, id=chapter_id, book__slug=book_slug)
        
        # Проверяем права доступа
        if request.user != chapter.book.owner:
            return Response(
                {'error': 'У вас немає прав для видалення цієї глави'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Удаляем файл главы, если он существует
        if chapter.file:
            if os.path.exists(chapter.file.path):
                os.remove(chapter.file.path)
        
        # Удаляем HTML-контент, если он существует
        if chapter.html_file_path:
            html_path = os.path.join(settings.MEDIA_ROOT, chapter.html_file_path)
            if os.path.exists(html_path):
                os.remove(html_path)
        
        # Удаляем главу
        chapter.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
        
    except Chapter.DoesNotExist:
        return Response(
            {'error': 'Главу не знайдено'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error deleting chapter: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class BookInfoView(generics.RetrieveAPIView):
    queryset = Book.objects.all()
    lookup_field = 'slug'
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        class BookInfoSerializer(serializers.ModelSerializer):
            image = serializers.SerializerMethodField()
            owner_username = serializers.SerializerMethodField()
            creator_username = serializers.SerializerMethodField()
            translation_status_display = serializers.CharField(source='get_translation_status_display', read_only=True)
            original_status_display = serializers.CharField(source='get_original_status_display', read_only=True)

            class Meta:
                model = Book
                fields = [
                    'id', 'title', 'title_en', 'author', 'description', 
                    'image', 'translation_status_display', 
                    'original_status_display', 'country', 'slug', 
                    'last_updated', 'owner', 'creator', 'adult_content',
                    'owner_username', 'creator_username', 'book_type'
                ]
                read_only_fields = fields

            def get_image(self, obj):
                if obj.image:
                    request = self.context.get('request')
                    if request:
                        return request.build_absolute_uri(obj.image.url)
                    return obj.image.url
                return None

            def get_owner_username(self, obj):
                return obj.owner.username if obj.owner else None

            def get_creator_username(self, obj):
                return obj.creator.username if obj.creator else None

        return BookInfoSerializer
