from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from apps.catalog.models import Book, Chapter
from apps.reviews.models import BookComment, ChapterComment
from .serializers import BookCommentSerializer, ChapterCommentSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
import logging
from rest_framework.exceptions import NotFound
from rest_framework.decorators import action

logger = logging.getLogger(__name__)


class BookCommentViewSet(viewsets.ModelViewSet):
    serializer_class = BookCommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        book_slug = self.kwargs.get('slug')
        book = get_object_or_404(Book, slug=book_slug)
        return BookComment.objects.filter(book=book, parent=None)  # Получаем только корневые комментарии

    def create(self, request, *args, **kwargs):
        logger.info(f"Received data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if request.user.is_authenticated:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response({"detail": "Authentication required to post comments."}, status=status.HTTP_403_FORBIDDEN)

    def perform_create(self, serializer):
        book_slug = self.kwargs.get('slug')
        book = get_object_or_404(Book, slug=book_slug)
        serializer.save(user=self.request.user, book=book)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response({'detail': 'Комментариев пока нет.'}, status=status.HTTP_200_OK)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_success_headers(self, data):
        try:
            return {'Location': str(data['url'])}
        except (TypeError, KeyError):
            return {}


class ChapterCommentViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterCommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        chapter_slug = self.kwargs.get('slug')
        chapter = get_object_or_404(Chapter, slug=chapter_slug)
        return ChapterComment.objects.filter(chapter=chapter, parent=None)  # Получаем только корневые комментарии

    def create(self, request, *args, **kwargs):
        logger.info(f"Received data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if request.user.is_authenticated:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response({"detail": "Authentication required to post comments."}, status=status.HTTP_403_FORBIDDEN)

    def perform_create(self, serializer):
        chapter_slug = self.kwargs.get('slug')
        chapter = get_object_or_404(Chapter, slug=chapter_slug)
        serializer.save(user=self.request.user, chapter=chapter)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response({'detail': 'Комментариев пока нет.'}, status=status.HTTP_200_OK)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_success_headers(self, data):
        try:
            return {'Location': str(data['url'])}
        except (TypeError, KeyError):
            return {}

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None, slug=None):
        parent_comment = self.get_object()
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, chapter=parent_comment.chapter, parent=parent_comment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LikeDislikeViewSet(viewsets.ViewSet):
    @action(detail=True, methods=['post'])
    def update_reaction(self, request, pk=None):
        logger.info(f"Received data: {request.data}")
        logger.info(f"User: {request.user}")
        logger.info(f"Comment ID: {pk}")
        
        comment_type = self.basename  # 'book-comment' или 'chapter-comment'
        action = request.data.get('action')
        
        logger.info(f"Comment type: {comment_type}")
        logger.info(f"Action: {action}")

        if comment_type == 'book-comment':
            comment = get_object_or_404(BookComment, pk=pk)
        elif comment_type == 'chapter-comment':
            comment = get_object_or_404(ChapterComment, pk=pk)
        else:
            logger.error(f"Invalid comment type: {comment_type}")
            return Response({'error': 'Неверный тип комментария'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.is_authenticated:
            logger.error("User is not authenticated")
            return Response({'error': 'Пользователь не аутентифицирован'}, status=status.HTTP_401_UNAUTHORIZED)

        if action == 'like':
            if user in comment.likes.all():
                comment.likes.remove(user)
            else:
                comment.likes.add(user)
                comment.dislikes.remove(user)
        elif action == 'dislike':
            if user in comment.dislikes.all():
                comment.dislikes.remove(user)
            else:
                comment.dislikes.add(user)
                comment.likes.remove(user)
        else:
            logger.error(f"Неверное действие: {action}")
            return Response({'error': 'Неверное действие'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ChapterCommentSerializer(comment, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def owner_like(self, request, pk=None):
        logger.info(f"Received owner like request for comment {pk}")
        comment_type = self.basename
        
        if comment_type == 'book-comment':
            comment = get_object_or_404(BookComment, pk=pk)
            serializer_class = BookCommentSerializer
        elif comment_type == 'chapter-comment':
            comment = get_object_or_404(ChapterComment, pk=pk)
            serializer_class = ChapterCommentSerializer
        else:
            return Response(
                {'error': 'Неверный тип комментария'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        book = comment.book if hasattr(comment, 'book') else comment.chapter.book
        
        if request.user != book.owner:
            return Response(
                {'error': 'Только владелец книги может ставить этот лайк'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Переключаем состояние owner_like
        if comment.owner_like == request.user:
            comment.owner_like = None
        else:
            comment.owner_like = request.user
        
        comment.save()
        
        serializer = serializer_class(comment, context={'request': request})
        return Response(serializer.data)
