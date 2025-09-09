import React, { useState, useEffect } from 'react';
import { mainAPI } from '../../api/main/mainAPI';

const UserAgreement = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        // Загружаем содержимое через API
        const response = await mainAPI.getUserAgreement();
        setContent(response.content);
        setTitle(response.title);
      } catch (err) {
        console.error('Error loading document:', err);
        setError('Помилка завантаження документа');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження документа...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default UserAgreement;
