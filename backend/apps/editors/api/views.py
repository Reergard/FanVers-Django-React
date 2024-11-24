from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.catalog.models import Chapter, Volume
from apps.catalog.api.serializers import ChapterSerializer
from .serializers import ChapterEditSerializer
import os
from django.db import transaction
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chapter_for_edit(request, chapter_id):
    chapter = get_object_or_404(Chapter, id=chapter_id)
    serializer = ChapterSerializer(chapter, context={'request': request})
    return Response(serializer.data)

@api_view(['PUT'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def update_chapter(request, chapter_id):
    chapter = get_object_or_404(Chapter, id=chapter_id)
    
    try:
        # Получаем текущие данные
        old_file = chapter.file if chapter.file else None
        
        # Обновляем основные поля
        if 'title' in request.data:
            chapter.title = request.data['title']
            
        if 'is_paid' in request.data:
            chapter.is_paid = request.data.get('is_paid') == 'true'
            
        if 'volume' in request.data:
            volume_id = request.data.get('volume')
            chapter.volume = Volume.objects.get(id=volume_id) if volume_id else None

        # Обрабатываем файл
        if 'file' in request.FILES:
            # Если есть старый файл, удаляем его
            if old_file:
                if os.path.isfile(old_file.path):
                    os.remove(old_file.path)
            chapter.file = request.FILES['file']

        chapter.save()
        
        serializer = ChapterSerializer(chapter, context={'request': request})
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_chapter_order_no_volume(request):
    try:
        chapter_orders = request.data.get('chapter_orders', [])
        
        with transaction.atomic():
            for order in chapter_orders:
                chapter = Chapter.objects.get(id=order['chapter_id'])
                new_position = float(order['position'])
                new_volume_id = order.get('volume_id')
                
                chapter._position = new_position
                if new_volume_id is not None:
                    chapter.volume_id = new_volume_id
                chapter.save()
        
        chapters = Chapter.objects.all().order_by('volume_id', '_position')
        serializer = ChapterSerializer(chapters, many=True, context={'request': request})
        
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_chapter_order(request, volume_id):
    try:
        chapter_orders = request.data.get('chapter_orders', [])
        
        with transaction.atomic():
            for order in chapter_orders:
                chapter = Chapter.objects.get(id=order['chapter_id'])
                chapter._position = order['position']
                chapter.save()
        
        chapters = Chapter.objects.filter(volume_id=volume_id)
        serializer = ChapterSerializer(chapters, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


