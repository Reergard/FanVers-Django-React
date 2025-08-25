import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { forceLogout } from "./auth/authSlice";
import PrivateRoute from "./auth/components/PrivateRoute";
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
import HomePage from './main/pages/HomePage';
import CreateTranslation from './catalog/pages/BookCreate';
import SearchPage from './users/pages/SearchPage';
import BookmarksPage from './users/pages/BookmarksPage';
import UserTranslations from './users/pages/UserTranslations';
import NotificationPage from './notification/pages/NotificationPage';
import Preloader from "./components/Preloader";
import ScrollToTop from "./components/ScrollToTop";
import "./components/Preloader.css";
import "./components/Scrollbar.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdvertisementSettings from './website_advertising/pages/AdvertisementSettings';
import AdvertisementsUsers from './users/pages/AdvertisementsUsers';
import AllSettings from './users/pages/settings/AllSettings';

// Legal pages
import UserAgreement from "./legal/pages/UserAgreement";
import PrivacyPolicy from "./legal/pages/PrivacyPolicy";
import ContentRules from "./legal/pages/ContentRules";
import Confidentiality from "./legal/pages/Confidentiality";
import AuthorAgreement from "./legal/pages/AuthorAgreement";

// Help pages
import TranslatorAgreement from "./help/pages/TranslatorAgreement";
import SayThanks from "./help/pages/SayThanks";
import Contacts from "./help/pages/Contacts";
import BalanceHelp from "./help/pages/BalanceHelp";
import Support from "./help/pages/Support";
import Payment from "./help/pages/Payment";
import { BreadCrumb } from './main/components/BreadCrumb';
import Faq from './catalog/pages/Faq';

const queryClient = new QueryClient();

function App() {
  const [load, updateLoad] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const dispatch = useDispatch();

  // Обробка події forceLogout від instance.js
  useEffect(() => {
    const handleForceLogout = () => {
      console.log('🚪 App: Отримано подію forceLogout, очищаємо Redux state');
      dispatch(forceLogout());
    };

    // Додаємо слухач події
    window.addEventListener('forceLogout', handleForceLogout);

    // Очищаємо слухач при розмонтуванні
    return () => {
      window.removeEventListener('forceLogout', handleForceLogout);
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
      <>
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
            <Route path="/create-translation" element={<CreateTranslation />} />
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
              path="/books/:slug/advertisement"
              element={
                <PrivateRoute>
                  <AdvertisementSettings />
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
            <Route path="/user-agreement" element={<UserAgreement />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/content-rules" element={<ContentRules />} />
            <Route path="/confidentiality" element={<Confidentiality />} />
            <Route path="/author-agreement" element={<AuthorAgreement />} />
            <Route
              path="/translator-agreement"
              element={<TranslatorAgreement />}
            />
            <Route path="/say-thanks" element={<SayThanks />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/balance-help" element={<BalanceHelp />} />
            <Route path="/support" element={<Support />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </>
    </QueryClientProvider>
  );
}

export default App;
