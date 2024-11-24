from rest_framework.response import Response
from apps.catalog.models import Book, Chapter, Genres, Tag, Country, Fandom, Volume, ChapterOrder
from apps.catalog.api.serializers import (
    BookSerializer, ChapterSerializer, GenresSerializer, TagSerializer,
    CountrySerializer, FandomSerializer, VolumeSerializer, ChapterOrderSerializer
)
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR
from rest_framework import status
import os
import mammoth
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from apps.navigation.models import Bookmark
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
import logging

logger = logging.getLogger(__name__)


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
def book_detail(request, slug):
    permission_classes = [AllowAny]
    try:
        book = Book.objects.get(slug=slug)
        serializer = BookSerializer(book)
        return JsonResponse(serializer.data, safe=False)
    except Book.DoesNotExist:
        return JsonResponse({'error': 'Book not found'}, status=404)


@api_view(['GET'])
def chapter_list(request, book_slug):
    try:
        book = get_object_or_404(Book, slug=book_slug)
        chapters = Chapter.objects.filter(book=book)
        
        if not chapters.exists():
            return Response([], status=status.HTTP_200_OK)
        
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
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
def chapter_detail(request, book_slug, chapter_slug):
    try:
        chapter = Chapter.objects.get(book__slug=book_slug, slug=chapter_slug)
        
        if chapter.is_paid and request.user.is_authenticated:
            is_purchased = request.user.profile.purchased_chapters.filter(id=chapter.id).exists()
            if not is_purchased:
                return Response(
                    {"error": "Необходимо купить главу для просмотра"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        html_content = chapter.get_html_content()
        
        if html_content is None:
            if not chapter.file or not os.path.exists(chapter.file.path):
                return Response(
                    {"error": "Файл главы не найден"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
                
            try:
                with open(chapter.file.path, "rb") as docx_file:
                    result = mammoth.convert_to_html(docx_file)
                    html_content = result.value
                    chapter.save_html_content(html_content)
            except Exception as e:
                return Response(
                    {"error": "Ошибка при конвертации файла главы"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response({
            'title': chapter.title,
            'content': html_content,
        })
        
    except Chapter.DoesNotExist:
        return Response(
            {"error": "Глава не найдена"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception:
        return Response(
            {"error": "Произошла ошибка при обработке главы"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def add_chapter(request, slug):
    try:
        book = get_object_or_404(Book, slug=slug)
        volume_id = request.data.get('volume')
        is_paid = request.data.get('is_paid')
        
        if 'file' not in request.FILES:
            return Response(
                {'error': 'Файл обязателен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        file = request.FILES['file']
        
        # Создаем главу
        chapter = Chapter.objects.create(
            book=book,
            title=request.data['title'],
            file=file,
            volume_id=volume_id,
            is_paid=str(is_paid).lower() == 'true'
        )
        
        # Конвертируем DOCX в HTML
        try:
            with open(chapter.file.path, "rb") as docx_file:
                result = mammoth.convert_to_html(docx_file)
                html_content = result.value
                
                # Сохраняем HTML контент
                chapter.save_html_content(html_content)
                
        except Exception as e:
            logger.error(f"Error converting chapter {chapter.id} to HTML: {str(e)}")
            # Даже если конвертация не удалась, глава все равно создана
            
        serializer = ChapterSerializer(chapter)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
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


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    lookup_field = 'slug'
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

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


class PublicBookViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AllowAny]


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
@parser_classes([MultiPartParser, FormParser])
def create_book(request):
    try:
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Необхідна авторизація'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = BookSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Создаем книгу с указанием создателя и владельца
            book = serializer.save(
                creator=request.user,
                owner=request.user
            )
            
            # Обрабатываем ManyToMany поля
            if 'genres' in request.data:
                genres_ids = request.data.getlist('genres[]')
                book.genres.set(genres_ids)
            
            if 'tags' in request.data:
                tags_ids = request.data.getlist('tags[]')
                book.tags.set(tags_ids)
            
            if 'fandoms' in request.data:
                fandoms_ids = request.data.getlist('fandoms[]')
                book.fandoms.set(fandoms_ids)
            
            # Обрабатываем изображение
            if 'image' in request.FILES:
                book.image = request.FILES['image']
                book.save()
            
            logger.info(f"Книга успешно создана: {book.id}, создатель: {request.user.username}")
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
        
        logger.error(f"Ошибка валидации: {serializer.errors}")
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
        
    except Exception as e:
        logger.error(f"Ошибка при создании книги: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def owned_books(request):
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Необхідна авторизація'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    books = Book.objects.filter(owner=request.user)
    serializer = BookSerializer(books, many=True, context={'request': request})
    return Response(serializer.data)




  
