import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import { navigationAPI } from '../../api/navigation/navigationAPI';
import BookDetailOwner from './BookDetailOwner';
import BookDetailReader from './BookDetailReader';
import ChapterRangeSelector from '../../navigation/components/ChapterRangeSelector';
import useBookAnalytics from '../../hooks/useBookAnalytics';

const BookDetailRouter = () => {
  const { slug } = useParams();
  const currentUser = useSelector(state => state.auth.user);
  const [currentStartChapter, setCurrentStartChapter] = useState(1);
  const { trackView } = useBookAnalytics();

  console.log('BookDetailRouter: загрузка для slug:', slug);

  // Load the book
  const { data: book, isLoading: bookLoading, error: bookError } = useQuery({
    queryKey: ['book', slug],
    queryFn: () => catalogAPI.fetchBook(slug),
    enabled: !!slug,
  });

  // Load chapters using the same API as BookDetailReader
  const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters', slug],
    queryFn: async () => {
      const response = await catalogAPI.getChapterList(slug);
      return response.data;
    },
    enabled: !!slug,
  });

  // Debug logging for chapters data
  useEffect(() => {
    if (chaptersData) {
      console.log('BookDetailRouter: Chapters data loaded:', {
        count: chaptersData.length,
        chapters: chaptersData.map(ch => ({ id: ch.id, title: ch.title, position: ch.position }))
      });
    }
  }, [chaptersData]);

  useEffect(() => {
    if (slug) {
      console.log('BookDetailRouter: отслеживание просмотра для slug:', slug);
      trackView(slug);
    }
  }, [slug, trackView]);

  // Логирование для отладки
  useEffect(() => {
    if (book) {
      console.log('BookDetailRouter: книга загружена:', {
        id: book.id,
        title: book.title,
        owner: book.owner,
        currentUser: currentUser?.id
      });
    }
  }, [book, currentUser]);

  useEffect(() => {
    if (chaptersData) {
      console.log('BookDetailRouter: главы загружены:', {
        count: chaptersData.length,
        chapters: chaptersData.map(ch => ({ id: ch.id, title: ch.title }))
      });
    }
  }, [chaptersData]);

  const handleRangeSelect = (startChapter) => {
    setCurrentStartChapter(startChapter);
  };

  if (bookLoading || chaptersLoading) {
    console.log('BookDetailRouter: загрузка...');
    return <div>Завантаження...</div>;
  }
  
  if (bookError) {
    console.error('BookDetailRouter: ошибка загрузки книги:', bookError);
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
    </>
  );
};

export default BookDetailRouter; 