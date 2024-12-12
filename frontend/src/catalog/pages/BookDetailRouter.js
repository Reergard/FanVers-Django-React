import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import BookDetailOwner from './BookDetailOwner';
import BookDetailReader from './BookDetailReader';

const BookDetailRouter = () => {
  const { slug } = useParams();
  const currentUser = useSelector(state => state.auth.user);
  
  const { data: book, isLoading, error } = useQuery({
    queryKey: ['book', slug],
    queryFn: () => catalogAPI.fetchBook(slug),
    enabled: !!slug,
  });

  if (isLoading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error.message}</div>;
  if (!book) return <div>Книгу не знайдено</div>;

  const isOwner = currentUser && book.owner === currentUser.id;

  return isOwner ? <BookDetailOwner book={book} /> : <BookDetailReader book={book} />;
};

export default BookDetailRouter; 