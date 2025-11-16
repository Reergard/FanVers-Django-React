import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forceLogout, setIsAuthenticated, setHasToken, getProfile, authFinishedLoading } from "./auth/authSlice";
import tokenService from "./auth/tokenService";
import PrivateRoute from "./auth/components/PrivateRoute";
import useAuthBootstrap from "./auth/hooks/useAuthBootstrap";
import Catalog from './catalog/pages/Catalog';
import AbandonedTranslations from './catalog/pages/AbandonedTranslations';
import MagicalGuide from './main/pages/MagicalGuide';
import BookDetailRouter from './catalog/pages/BookDetailRouter';
import ChapterDetail from './catalog/pages/ChapterDetail';
import AddChapter from './catalog/pages/AddChapter';

import Profile from './users/pages/Profile';
import TranslatorsList from './users/pages/TranslatorsList';
import Authors from './users/pages/Authors';
import ProfilesUsers from './users/pages/ProfilesUsers';
// import BookmarksPage from './users/pages/BookmarksPage';
import ChatPage from './chat/pages/ChatPage';
import EditChapter from './editors/pages/EditChapter';
import Header from './main/components/Header/Header';
import Footer from './main/components/Footer';
import HomePage from './main/pages/HomePage.jsx';
import CreateTranslation from './catalog/pages/BookCreate';
import SearchPage from './search/pages/SearchPage';
import BookmarksPage from './users/pages/BookmarksPage';
import UserTranslations from './users/pages/UserTranslations';
import NotificationPage from './notification/pages/NotificationPage';
import Preloader from "./components/Preloader";
import ScrollToTop from "./components/ScrollToTop";
import "./components/Preloader.css";
import "./components/Scrollbar.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdvertisementsUsers from './users/pages/AdvertisementsUsers';
import AllSettings from './catalog/pages/settings/AllSettings';

// Legal pages
import UserAgreement from "./info/legal/user-agreement";
import PrivacyPolicy from "./info/legal/privacy-policy";
import ContentRules from "./info/legal/content-rules";
import AuthorAgreement from "./info/legal/author-agreement";
import ForCopyrightHolders from "./info/legal/for-copyright-holders";

// Help pages
import TranslatorAgreement from "./info/legal/translator-agreement";
import SayThanks from "./info/help/say-thanks";
import Contacts from "./info/help/contacts";
import BalanceHelp from "./info/help/faq/balance-help";
import Support from "./info/help/support";
import Payment from "./info/help/payment";
import FAQ from "./info/help/faq";
import PaymentsFAQ from "./info/help/faq/payments";
import { BreadCrumb } from './main/components/BreadCrumb';
import Faq from './catalog/pages/Faq';

// Custom Toast System
import { ToastProvider } from './components/CustomToast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут (было cacheTime)
    },
  },
});

function App() {
  const [load, updateLoad] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Селекторы для состояния авторизации
  const { isAuthenticated, hasToken } = useSelector((state) => state.auth);
  
  // Автоматическое восстановление сессии через refresh cookie
  // Вызывается при загрузке, фокусе окна, изменении видимости
  useAuthBootstrap();

  // Инициализация auth при загрузке приложения
  useEffect(() => {
    // Проверяем наличие window для SSR
    if (typeof window === 'undefined') {
      dispatch(authFinishedLoading());
      return;
    }
    
    // УБРАНА СТАРАЯ ЛОГИКА: больше не проверяем localStorage.getItem('token')
    // Теперь используем только tokenService.hasAccess() (токен в памяти)
    // и refresh cookie для восстановления сессии
    
    // Проверяем токен в памяти (если был сохранен до перезагрузки страницы)
    console.log('📱 [App] Проверяем токен в памяти...');
    const hasTokenInMemory = tokenService.hasAccess();
    console.log('📱 [App] Token в памяти:', hasTokenInMemory ? 'ЕСТЬ' : 'НЕТ');
    
    if (hasTokenInMemory) {
      // Есть токен в памяти — загружаем профиль
      console.log('📱 [App] Токен найден, загружаем профиль...');
      dispatch(getProfile());
    } else {
      // Нет токена в памяти — заканчиваем загрузку
      // useAuthBootstrap попытается восстановить сессию через refresh cookie
      console.log('📱 [App] Токена нет, завершаем загрузку. useAuthBootstrap попытается восстановить сессию');
      dispatch(authFinishedLoading());
    }
  }, [dispatch]);

  // Обробка події forceLogout від instance.js
  useEffect(() => {
    const handleForceLogout = () => {
      console.log('🚪 [App] Получено событие forceLogout, очищаем Redux state');
      dispatch(forceLogout());
      dispatch(setIsAuthenticated(false));
      // Останавливаем мониторинг токенов
      tokenService.stopTokenMonitoring();
      console.log('🚪 [App] Redux state очищен, мониторинг токенов остановлен');
    };

    // Синхронизация между вкладками
    const handleStorageChange = (e) => {
      if (e.key === 'auth_logout') {
        console.log('🚪 [App] Синхронизация логаута с другой вкладкой');
        dispatch(forceLogout());
        dispatch(setIsAuthenticated(false));
        // Останавливаем мониторинг токенов
        tokenService.stopTokenMonitoring();
        localStorage.removeItem('auth_logout'); // Очищаем ключ для чистоты
        console.log('🚪 [App] Логаут синхронизирован');
      }
    };

    // Додаємо слухачі подій
    window.addEventListener('forceLogout', handleForceLogout);
    window.addEventListener('storage', handleStorageChange);

    // Очищаємо слухачі при розмонтуванні
    return () => {
      window.removeEventListener('forceLogout', handleForceLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch]);

  useEffect(() => {
    if (location.pathname === "/create-translation") {
      document.body.classList.add("translation-bg");
    } else {
      document.body.classList.remove("translation-bg");
    }
  }, [location.pathname]);

  useEffect(() => {
    try {
      const timer = setTimeout(() => {
        updateLoad(false);
      }, 1200);

      return () => clearTimeout(timer);
    } catch (err) {
      setError(err);
      console.error("Loading error:", err);
    }
  }, []);

  if (error) {
    return <div>Error loading application: {error.message}</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Preloader load={load} />
        <div className="App" id="scroll">
          <Header />
          {/* <BreadCrumb items={[
            { href: "/", label: "Головна" },
            { href: "/catalog", label: "Каталог" },
            { href: "/own-translations", label: "Власні переклади" },
          ]} /> */}
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/magical-guide" element={<MagicalGuide />} />
            <Route path="/all-settings" element={<AllSettings />} />
            <Route path="/books/:slug" element={<BookDetailRouter />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/translators" element={<TranslatorsList />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/faq" element={<Faq />} />
            
            <Route path="/abandoned-translations" element={<AbandonedTranslations />} />
            <Route path="/profile/:userId" element={<ProfilesUsers />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/bookmarks"
              element={
                <PrivateRoute>
                  <BookmarksPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/notification"
              element={
                <PrivateRoute>
                  <NotificationPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/books/:slug/add-chapter"
              element={
                <PrivateRoute>
                  <AddChapter />
                </PrivateRoute>
              }
            />
            <Route
              path="/books/:bookSlug/chapters/:chapterSlug"
              element={<ChapterDetail />}
            />
            <Route path="/chapters/:chapterId/edit" element={<EditChapter />} />
            <Route
              path="/create-translation"
              element={
                <PrivateRoute>
                  <CreateTranslation />
                </PrivateRoute>
              }
            />
            <Route
              path="/User-translations"
              element={
                <PrivateRoute>
                  <UserTranslations />
                </PrivateRoute>
              }
            />
            <Route
              path="/books/:slug/settings"
              element={
                <PrivateRoute>
                  <AllSettings />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/my-advertisements"
              element={
                <PrivateRoute>
                  <AdvertisementsUsers />
                </PrivateRoute>
              }
            />
            <Route path="/info/legal/user-agreement" element={<UserAgreement />} />
            <Route path="/info/legal/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/info/legal/content-rules" element={<ContentRules />} />
            <Route path="/info/legal/for-copyright-holders" element={<ForCopyrightHolders />} />
            <Route path="/info/legal/author-agreement" element={<AuthorAgreement />} />
            <Route
              path="/info/legal/translator-agreement"
              element={<TranslatorAgreement />}
            />
            <Route path="/info/help/say-thanks" element={<SayThanks />} />
            <Route path="/info/help/contacts" element={<Contacts />} />
            <Route path="/info/help/faq" element={<FAQ />} />
            <Route path="/info/help/faq/payments" element={<PaymentsFAQ />} />
            <Route path="/info/help/faq/balance-help" element={<BalanceHelp />} />
            <Route path="/info/help/support" element={<Support />} />
            <Route path="/info/help/payment" element={<Payment />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
