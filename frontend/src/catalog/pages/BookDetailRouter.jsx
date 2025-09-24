import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import { navigationAPI } from '../../api/navigation/navigationAPI';
import { mainAPI } from '../../api/main/mainAPI';
import BookDetailOwner from './BookDetailOwner';
import BookDetailReader from './BookDetailReader';
import ChapterRangeSelector from '../../navigation/components/ChapterRangeSelector';
import CommentSection from '../../reviews/components/CommentSection';
import useBookAnalytics from '../../hooks/useBookAnalytics';
import { useToast } from '../../components/CustomToast';

const BookDetailRouter = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.auth.user);
  const [currentStartChapter, setCurrentStartChapter] = useState(1);
  const { trackView } = useBookAnalytics();
  const { error: showError } = useToast();

  console.log('BookDetailRouter: загрузка для slug:', slug);

  // Load the book
  const { data: book, isLoading: bookLoading, error: bookError } = useQuery({
    queryKey: ['book', slug],
    queryFn: () => catalogAPI.fetchBook(slug),
    enabled: !!slug,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });

  // Load chapters using the same API as BookDetailReader
  const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters', slug],
    queryFn: async () => {
      const response = await catalogAPI.getChapterList(slug);
      return response.data;
    },
    enabled: !!slug,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });

  // Load volumes - moved from individual components to avoid duplication
  const { data: volumes = [] } = useQuery({
    queryKey: ['volumes', slug],
    queryFn: async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/catalog/books/${slug}/volumes/`);
        console.log('Volumes loaded in router:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error loading volumes in router:', error);
        return [];
      }
    },
    enabled: !!slug,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });

  // УДАЛЕНО: Дублирующийся запрос books-news (уже есть в HomePage2.js)
  // Это вызывало бесконечные перезапросы!

  // Debug logging for chapters data - объединяем в один useEffect
  useEffect(() => {
    if (chaptersData) {
      console.log('BookDetailRouter: Chapters data loaded:', {
        count: chaptersData.length,
        chapters: chaptersData.map(ch => ({ id: ch.id, title: ch.title, position: ch.position }))
      });
    }
  }, [chaptersData?.length]); // Используем только длину массива

  useEffect(() => {
    if (slug) {
      console.log('BookDetailRouter: отслеживание просмотра для slug:', slug);
      trackView(slug);
    }
  }, [slug]); // Убираем trackView из зависимостей

  // Логирование для отладки - объединяем в один useEffect
  useEffect(() => {
    if (book) {
      console.log('BookDetailRouter: книга загружена:', {
        id: book.id,
        title: book.title,
        owner: book.owner,
        currentUser: currentUser?.id
      });
    }
  }, [book?.id, currentUser?.id]); // Используем только ID вместо объектов

  const handleRangeSelect = (startChapter) => {
    setCurrentStartChapter(startChapter);
  };

  if (bookLoading || chaptersLoading) {
    console.log('BookDetailRouter: загрузка...');
    return <div>Завантаження...</div>;
  }
  
  if (bookError) {
    console.error('BookDetailRouter: ошибка загрузки книги:', bookError);
    
    // Якщо помилка 403 - це означає, що немає доступу до книги
    if (bookError.message?.includes('403') || bookError.message?.includes('Forbidden')) {
      showError('Власник цієї книги обмежив доступ до неї');
      navigate(-1); // Повертаємося назад
      return null;
    }
    
    return <div>Помилка: {bookError.message}</div>;
  }
  
  if (!book) {
    console.warn('BookDetailRouter: книга не найдена');
    return <div>Книгу не знайдено</div>;
  }

  const isOwner = currentUser && book.owner === currentUser.id;
  console.log('BookDetailRouter: определение владельца:', { isOwner, currentUser: currentUser?.id, bookOwner: book.owner });

  // Common props you may want to pass to the views
  const commonProps = {
    book,
    chapters: chaptersData || [],
    volumes: volumes || [],
    // books: удалено - дублирующийся запрос
    currentRange: { start: 1, end: chaptersData?.length || 0 },
    totalChapters: chaptersData?.length || 0,
  };

  return (
    <>
      {/* Optional, lightweight control that is "routing-friendly" */}
      {chaptersData && chaptersData.length > 50 && (
        <ChapterRangeSelector
          pageRanges={[
            { start: 1, end: 50, label: '1-50' },
            { start: 51, end: chaptersData.length, label: `51-${chaptersData.length}` }
          ]}
          currentRange={commonProps.currentRange}
          onRangeSelect={handleRangeSelect}
        />
      )}

      {/* Decide which detailed view to render. */}
      {isOwner ? (
        <BookDetailOwner {...commonProps} />
      ) : (
        <BookDetailReader {...commonProps} />
      )}
      
      {/* Общая секция комментариев */}
      <CommentSection 
        type="book"
        slug={slug} 
        isOwner={isOwner} 
      />
    </>
  );
};

export default BookDetailRouter; 
