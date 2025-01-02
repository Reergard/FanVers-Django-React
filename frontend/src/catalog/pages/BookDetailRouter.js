import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import { navigationAPI } from '../../api/navigation/navigationAPI';
import BookDetailOwner from './BookDetailOwner';
import BookDetailReader from './BookDetailReader';
import ChapterRangeSelector from '../../navigation/components/ChapterRangeSelector';

const BookDetailRouter = () => {
  const { slug } = useParams();
  const currentUser = useSelector(state => state.auth.user);
  const [currentStartChapter, setCurrentStartChapter] = useState(1);
  
  const { data: book, isLoading: bookLoading, error: bookError } = useQuery({
    queryKey: ['book', slug],
    queryFn: () => catalogAPI.fetchBook(slug),
    enabled: !!slug,
  });

  const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
    queryKey: ['paginatedChapters', book?.id, currentStartChapter],
    queryFn: () => navigationAPI.getPaginatedChapters(book.id, currentStartChapter),
    enabled: !!book?.id,
  });

  const handleRangeSelect = (startChapter) => {
    setCurrentStartChapter(startChapter);
  };

  if (bookLoading || chaptersLoading) return <div>Завантаження...</div>;
  if (bookError) return <div>Помилка: {bookError.message}</div>;
  if (!book) return <div>Книгу не знайдено</div>;

  const isOwner = currentUser && book.owner === currentUser.id;
  const commonProps = {
    book,
    chapters: chaptersData?.chapters || [],
    currentRange: chaptersData?.current_range,
    totalChapters: chaptersData?.total_chapters,
  };

  return (
    <>
      {chaptersData?.total_chapters > 0 && (
        <div className="total-chapters">
          Всього розділів: {chaptersData.total_chapters}
        </div>
      )}
      {chaptersData?.page_ranges && chaptersData.page_ranges.length > 0 && (
        <ChapterRangeSelector
          pageRanges={chaptersData.page_ranges}
          currentRange={chaptersData.current_range}
          onRangeSelect={handleRangeSelect}
        />
      )}
      {isOwner ? (
        <BookDetailOwner {...commonProps} />
      ) : (
        <BookDetailReader {...commonProps} />
      )}
    </>
  );
};

export default BookDetailRouter; 