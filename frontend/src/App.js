import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from 'react-router-dom';
import PrivateRoute from './auth/components/PrivateRoute';
import Catalog from './catalog/pages/Catalog';
import BookDetail from './catalog/pages/BookDetail';
import ChapterDetail from './catalog/pages/ChapterDetail';
import AddChapter from './catalog/pages/AddChapter';
import SearchPage from './search/SearchPage';
import Profile from './users/pages/Profile';
import BookmarksPage from './navigation/pages/BookmarksPage';
import ChatPage from './chat/pages/ChatPage';
import EditChapter from './editors/pages/EditChapter';
import Header from './main/components/Header/Header';
import Footer from './main/components/Footer';
import HomePage from './main/pages/HomePage';
import CreateTranslation from './catalog/pages/BookCreate';
import UserTranslations from './users/pages/UserTranslations';
import NotificationPage from './notification/pages/NotificationPage';
import Preloader from "./components/Preloader";
import ScrollToTop from "./components/ScrollToTop";
import "./components/Preloader.css";
import "./components/Scrollbar.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const [load, updateLoad] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const timer = setTimeout(() => {
        updateLoad(false);
      }, 1200);

      return () => clearTimeout(timer);
    } catch (err) {
      setError(err);
      console.error('Loading error:', err);
    }
  }, []);

  if (error) {
    return <div>Error loading application: {error.message}</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <>
        <Preloader load={load} />
        <div className="App" id="scroll">
          <Header />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/books/:slug" element={<BookDetail />} />
            <Route path="/create-translation" element={<CreateTranslation />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/bookmarks" element={
              <PrivateRoute>
                <BookmarksPage />
              </PrivateRoute>
            } />
            <Route path="/chat" element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            } />
            <Route path="/notification" element={
              <PrivateRoute>
                <NotificationPage />
              </PrivateRoute>
            } /> 
            <Route path="/books/:slug/add-chapter" element={
              <PrivateRoute>
                <AddChapter />
              </PrivateRoute>
            } />
            <Route path="/books/:bookSlug/chapters/:chapterSlug" element={<ChapterDetail />} />
            <Route path="/chapters/:chapterId/edit" element={<EditChapter />} />
            <Route path="/create-translation" element={
              <PrivateRoute>
                <CreateTranslation />
              </PrivateRoute>
            } />
            <Route path="/User-translations" element={
              <PrivateRoute>
                <UserTranslations />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </>
    </QueryClientProvider>
  );
}

export default App;
