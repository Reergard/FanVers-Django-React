# Структура проекта FanVers

> Сгенерировано автоматически: 28.09.2025 
20:57

## Статистика проекта

- **Всего файлов:** 749
- **Всего папок:** 9,089
- **Общий размер:** 121.5MB

## Структура проекта

```
├── backend/
│   ├── apps/
│   │   ├── analytics_books/
│   │   │   ├── api/
│   │   │   │   ├── urls.py (296.0B)
│   │   │   │   └── views.py (8.6KB)

│   │   │   ├── management/
│   │   │   │   └── commands/
│   │   │   │       └── cleanup_analytics.py (1.0KB)


│   │   │   ├── __init__.py (0B)
│   │   │   ├── admin.py (66.0B)
│   │   │   ├── apps.py (222.0B)
│   │   │   ├── models.py (2.8KB)
│   │   │   ├── tasks.py (674.0B)
│   │   │   ├── tests.py (63.0B)
│   │   │   └── views.py (66.0B)

│   │   ├── api/
│   │   │   ├── __init__.py (0B)
│   │   │   ├── exc_handlers.py (1.3KB)
│   │   │   ├── permissions.py (55.0B)
│   │   │   └── urls.py (940.0B)

│   │   ├── catalog/
│   │   │   ├── api/
│   │   │   │   ├── __init__.py (0B)
│   │   │   │   ├── permissions.py (2.0KB)
│   │   │   │   ├── serializers.py (14.1KB)
│   │   │   │   ├── urls.py (2.1KB)
│   │   │   │   └── views.py (30.4KB)

│   │   │   ├── management/
│   │   │   │   └── commands/
│   │   │   │       ├── fix_free_chapters.py (1.1KB)
│   │   │   │       ├── generate_html_content.py (2.2KB)
│   │   │   │       ├── update_characters_count.py (1.3KB)
│   │   │   │       └── update_recent_chapters.py (2.3KB)


│   │   │   ├── utils/
│   │   │   │   ├── __init__.py (0B)
│   │   │   │   └── errorUtils.py (539.0B)

│   │   │   ├── __init__.py (54.0B)
│   │   │   ├── admin.py (4.9KB)
│   │   │   ├── apps.py (9.5KB)
│   │   │   ├── models.py (17.3KB)
│   │   │   └── tests.py (63.0B)

│   │   ├── chat/
│   │   │   ├── api/
│   │   │   │   ├── __init__.py (0B)
│   │   │   │   ├── serializers.py (2.8KB)
│   │   │   │   ├── urls.py (346.0B)
│   │   │   │   └── views.py (5.5KB)

│   │   │   ├── __init__.py (0B)
│   │   │   ├── admin.py (1.6KB)
│   │   │   ├── apps.py (144.0B)
│   │   │   ├── consumers.py (9.9KB)
│   │   │   ├── models.py (1.8KB)
│   │   │   └── routing.py (229.0B)

│   │   ├── core/
│   │   │   └── smart_throttling.py (2.6KB)

│   │   ├── editors/
│   │   │   ├── api/
│   │   │   │   ├── __init__.py (0B)
│   │   │   │   ├── serializers.py (2.1KB)
│   │   │   │   ├── urls.py (689.0B)
│   │   │   │   └── views.py (6.5KB)

│   │   │   ├── __init__.py (0B)
│   │   │   ├── admin.py (66.0B)
│   │   │   ├── apps.py (157.0B)
│   │   │   ├── models.py (1.9KB)
│   │   │   └── tests.py (63.0B)

│   │   ├── main/
│   │   │   ├── api/
│   │   │   │   ├── __init__.py (0B)
│   │   │   │   ├── permissions.py (233.0B)
│   │   │   │   ├── serializers.py (3.9KB)
│   │   │   │   ├── urls.py (945.0B)
│   │   │   │   └── views.py (17.9KB)

│   │   │   ├── management/
│   │   │   │   └── commands/


│   │   │   ├── __init__.py (0B)
│   │   │   ├── admin.py (38.0B)
│   │   │   ├── apps.py (151.0B)
│   │   │   ├── middleware.py (348.0B)
│   │   │   ├── models.py (38.0B)
│   │   │   └── tests.py (63.0B)

│   │   ├── monitoring/
│   │   │   ├── api/
│   │   │   │   ├── __init__.py (0B)
│   │   │   │   ├── serializers.py (1.7KB)
│   │   │   │   ├── urls.py (514.0B)
│   │   │   │   └── views.py (9.8KB)

│   │   │   ├── __init__.py (0B)
│   │   │   ├── admin.py (5.7KB)
│   │   │   ├── apps.py (163.0B)
│   │   │   ├── models.py (8.5KB)
│   │   │   └── tests.py (63.0B)

│   │   ├── navigation/
│   │   │   ├── api/
│   │   │   │   ├── __init__.py (0B)
│   │   │   │   ├── serializers.py (994.0B)
│   │   │   │   ├── urls.py (913.0B)
│   │   │   │   └── views.py (8.7KB)

│   │   │   ├── __init__.py (0B)
│   │   │   ├── admin.py (0B)
│   │   │   ├── apps.py (0B)
│   │   │   ├── models.py (2.0KB)
│   │   │   └── tests.py (0B)

│   │   ├── notification/
│   │   │   ├── api/
│   │   │   │   ├── __init__.py (0B)
│   │   │   │   ├── serializers.py (1.9KB)
│   │   │   │   ├── urls.py (272.0B)
│   │   │   │   └── views.py (4.5KB)

│   │   │   ├── __init__.py (0B)
│   │   │   ├── admin.py (66.0B)
│   │   │   ├── apps.py (280.0B)
│   │   │   ├── models.py (1.1KB)
│   │   │   ├── signals.py (2.7KB)
│   │   │   ├── tasks.py (2.1KB)
│   │   │   └── tests.py (63.0B)

│   │   ├── rating/
│   │   │   ├── api/
│   │   │   │   ├── __init__.py (0B)
│   │   │   │   ├── serializers.py (1.8KB)
│   │   │   │   ├── urls.py (332.0B)
│   │   │   │   └── views.py (4.6KB)

│   │   │   ├── __init__.py (0B)
│   │   │   ├── admin.py (367.0B)
│   │   │   ├── apps.py (155.0B)
│   │   │   ├── models.py (973.0B)
│   │   │   └── tests.py (63.0B)

│   │   ├── reviews/
│   │   │   ├── api/
│   │   │   │   ├── __init__.py (0B)
│   │   │   │   ├── serializers.py (5.0KB)
│   │   │   │   ├── urls.py (627.0B)
│   │   │   │   └── views.py (11.8KB)

│   │   │   ├── __init__.py (2.0B)
│   │   │   ├── admin.py (66.0B)
│   │   │   ├── apps.py (181.0B)
│   │   │   ├── models.py (1.2KB)
│   │   │   └── tests.py (63.0B)

│   │   ├── search/
│   │   │   ├── api/
│   │   │   │   ├── __init__.py (0B)
│   │   │   │   ├── permissions.py (55.0B)
│   │   │   │   ├── serializers.py (40.0B)
│   │   │   │   ├── urls.py (206.0B)
│   │   │   │   └── views.py (794.0B)

│   │   │   ├── __init__.py (0B)
│   │   │   ├── admin.py (66.0B)
│   │   │   ├── apps.py (155.0B)
│   │   │   ├── filters.py (2.5KB)
│   │   │   ├── models.py (60.0B)
│   │   │   └── tests.py (63.0B)

│   │   ├── users/
│   │   │   ├── api/
│   │   │   │   ├── __init__.py (1.0KB)
│   │   │   │   ├── balance_views.py (14.1KB)
│   │   │   │   ├── mixins.py (5.2KB)
│   │   │   │   ├── permissions.py (55.0B)
│   │   │   │   ├── serializers.py (22.6KB)
│   │   │   │   ├── urls.py (2.3KB)
│   │   │   │   └── views.py (23.8KB)

│   │   │   ├── management/
│   │   │   │   ├── commands/
│   │   │   │   │   └── __init__.py (0B)

│   │   │   │   └── __init__.py (0B)

│   │   │   ├── __init__.py (0B)
│   │   │   ├── admin.py (7.6KB)
│   │   │   ├── apps.py (147.0B)
│   │   │   ├── forms.py (2.5KB)
│   │   │   ├── managers.py (2.0KB)
│   │   │   ├── middleware.py (392.0B)
│   │   │   ├── models.py (14.1KB)
│   │   │   └── tests.py (63.0B)

│   │   └── website_advertising/
│   │       ├── api/
│   │       │   ├── __init__.py (0B)
│   │       │   ├── serializers.py (2.4KB)
│   │       │   ├── urls.py (301.0B)
│   │       │   └── views.py (12.0KB)

│   │       ├── __init__.py (0B)
│   │       ├── admin.py (1.6KB)
│   │       ├── apps.py (222.0B)
│   │       ├── models.py (2.1KB)
│   │       └── tests.py (63.0B)


│   ├── FanVers_project/
│   │   ├── __init__.py (0B)
│   │   ├── asgi.py (794.0B)
│   │   ├── celery.py (1.0KB)
│   │   ├── settings.py (16.1KB)
│   │   ├── urls.py (444.0B)
│   │   └── wsgi.py (431.0B)

│   ├── legal/
│   │   ├── __init__.py (0B)
│   │   ├── admin.py (66.0B)
│   │   ├── apps.py (148.0B)
│   │   ├── models.py (60.0B)
│   │   ├── tests.py (63.0B)
│   │   └── views.py (66.0B)

│   ├── .env (657.0B)
│   ├── .gitignore (269.0B)
│   ├── manage.py (693.0B)
│   ├── nginx_throttling.conf (2.3KB)
│   ├── requirements.txt (2.1KB)
│   └── run_daphne.py (733.0B)

├── frontend/
│   ├── public/
│   │   ├── arrow.svg (804.0B)
│   │   ├── favicon.ico (15.0KB)
│   │   ├── homepage.png (250.9KB)
│   │   ├── index.html (947.0B)
│   │   ├── logo192.png (98.0KB)
│   │   ├── logo512.png (98.0KB)
│   │   ├── manifest.json (492.0B)
│   │   └── robots.txt (70.0B)

│   ├── src/
│   │   ├── api/
│   │   │   ├── analytics_books/
│   │   │   │   └── analytics_booksAPI.js (934.0B)

│   │   │   ├── auth/
│   │   │   │   └── authAPI.js (684.0B)

│   │   │   ├── catalog/
│   │   │   │   └── catalogAPI.js (25.6KB)

│   │   │   ├── chat/
│   │   │   │   └── api.js (1.4KB)

│   │   │   ├── editors/
│   │   │   │   └── editorsAPI.js (2.2KB)

│   │   │   ├── main/
│   │   │   │   └── mainAPI.js (7.0KB)

│   │   │   ├── monitoring/
│   │   │   │   └── monitoringAPI.js (4.2KB)

│   │   │   ├── navigation/
│   │   │   │   └── navigationAPI.js (3.6KB)

│   │   │   ├── notification/
│   │   │   │   └── notificationAPI.js (6.9KB)

│   │   │   ├── rating/
│   │   │   │   └── ratingAPI.js (1.4KB)

│   │   │   ├── reviews/
│   │   │   │   └── reviewsAPI.js (7.8KB)

│   │   │   ├── search/
│   │   │   │   └── searchAPI.js (2.3KB)

│   │   │   ├── users/
│   │   │   │   └── usersAPI.js (9.5KB)

│   │   │   ├── website_advertising/
│   │   │   │   └── website_advertisingAPI.js (6.1KB)

│   │   │   ├── index.js (833.0B)
│   │   │   └── instance.js (7.3KB)

│   │   ├── assets/
│   │   │   ├── fonts/
│   │   │   │   ├── A.AlleycatICG.Alen_.Rus_.ttf (52.9KB)
│   │   │   │   ├── ArnoPro-BoldItalic.woff (333.8KB)
│   │   │   │   ├── ArnoPro-BoldItalic.woff2 (184.5KB)
│   │   │   │   ├── WindSong-Medium.ttf (248.1KB)
│   │   │   │   └── WindSong-Regular.ttf (239.8KB)

│   │   │   ├── images/
│   │   │   │   ├── bg/
│   │   │   │   │   ├── bg-orange.png (63.9KB)
│   │   │   │   │   ├── burger_border.png (21.9KB)
│   │   │   │   │   ├── burger_border.svg (1.1KB)
│   │   │   │   │   └── Rectangle 4049.png (75.2KB)

│   │   │   │   ├── icons/
│   │   │   │   │   ├── 18+.png (2.0KB)
│   │   │   │   │   ├── chevron_right.svg (157.0B)
│   │   │   │   │   ├── facebook.png (980.0B)
│   │   │   │   │   ├── frame.svg (4.6KB)
│   │   │   │   │   ├── ghost.png (24.6KB)
│   │   │   │   │   ├── ghost_full.png (24.9KB)
│   │   │   │   │   ├── home-bg.jpg (31.4KB)
│   │   │   │   │   ├── instagram.png (1.1KB)
│   │   │   │   │   ├── notification-bell.svg (995.0B)
│   │   │   │   │   ├── profile-decoration-2.svg (314.0B)
│   │   │   │   │   ├── profile-icon.png (2.9KB)
│   │   │   │   │   ├── profile-menu.svg (364.0B)
│   │   │   │   │   ├── Search_light.svg (251.0B)
│   │   │   │   │   └── youtube.png (863.0B)

│   │   │   │   └── logo/
│   │   │   │       ├── logo.jpg (98.0KB)
│   │   │   │       ├── logo.png (95.3KB)
│   │   │   │       ├── logo2.0.png (2.0MB)
│   │   │   │       └── logo2.0_250.png (71.1KB)


│   │   │   └── pre.svg (1.9KB)

│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginModal.js (3.6KB)
│   │   │   │   ├── PrivateRoute.jsx (966.0B)
│   │   │   │   └── RegisterModal.js (4.2KB)

│   │   │   ├── hooks/
│   │   │   │   └── useAuth.js (6.4KB)

│   │   │   ├── styles/
│   │   │   │   ├── AuthModal.css (1.9KB)
│   │   │   │   └── Profile.css (1.0KB)

│   │   │   ├── utils/
│   │   │   │   └── authErrorUtils.js (5.4KB)

│   │   │   ├── authService.js (5.2KB)
│   │   │   ├── authSlice.js (12.9KB)
│   │   │   └── tokenService.js (5.4KB)

│   │   ├── catalog/
│   │   │   ├── components/
│   │   │   │   ├── css/
│   │   │   │   │   └── TranslationSettingsButton.css (937.0B)

│   │   │   │   ├── styles/

│   │   │   │   ├── CatalogAdvertisingCarousel.jsx (7.2KB)
│   │   │   │   ├── TranslationSettingsButton.js (508.0B)
│   │   │   │   └── TranslatorAccessGuard.js (3.7KB)

│   │   │   ├── css/
│   │   │   │   ├── AllSettings.module.css (8.8KB)
│   │   │   │   ├── BookCreate.css (11.1KB)
│   │   │   │   ├── BookDetail.css (1.3KB)
│   │   │   │   ├── BookDetailRouter.module.css (16.5KB)
│   │   │   │   ├── Catalog.css (6.8KB)
│   │   │   │   ├── ChapterDetail.css (9.4KB)
│   │   │   │   ├── Faq.module.css (572.0B)
│   │   │   │   └── SettingsBooks.css (11.1KB)

│   │   │   ├── pages/
│   │   │   │   ├── img/
│   │   │   │   │   ├── 18.svg (9.2KB)
│   │   │   │   │   ├── anothers_books.svg (1.4KB)
│   │   │   │   │   ├── arrow-name-chapter.png (330.0B)
│   │   │   │   │   ├── arrow-select.png (198.0B)
│   │   │   │   │   ├── arrowCreate.png (287.0B)
│   │   │   │   │   ├── author.svg (228.9KB)
│   │   │   │   │   ├── background.png (1.2MB)
│   │   │   │   │   ├── bg-chapter.png (40.9KB)
│   │   │   │   │   ├── bg-dragons.png (1.1MB)
│   │   │   │   │   ├── book-mini.svg (2.4KB)
│   │   │   │   │   ├── calendar.png (658.0B)
│   │   │   │   │   ├── calendar.svg (10.2KB)
│   │   │   │   │   ├── Check_ring_light.svg (1.9KB)
│   │   │   │   │   ├── dragons.svg (63.2KB)
│   │   │   │   │   ├── edit.svg (1.4KB)
│   │   │   │   │   ├── image__book-cart.png (282.3KB)
│   │   │   │   │   ├── img_upload.png (1.3KB)
│   │   │   │   │   ├── left-footer.svg (72.3KB)
│   │   │   │   │   ├── linear_for_books.svg (513.0B)
│   │   │   │   │   ├── read.png (342.0B)
│   │   │   │   │   ├── right-footer.svg (72.3KB)
│   │   │   │   │   ├── Setting.svg (20.0KB)
│   │   │   │   │   ├── Star_fill.svg (1.6KB)
│   │   │   │   │   ├── thanks.svg (19.0KB)
│   │   │   │   │   ├── Trash.svg (994.0B)
│   │   │   │   │   └── triangle.svg (956.0B)

│   │   │   │   ├── settings/
│   │   │   │   │   ├── AccessRights.jsx (6.3KB)
│   │   │   │   │   ├── Advertising.jsx (32.8KB)
│   │   │   │   │   ├── AllSettings.jsx (6.0KB)
│   │   │   │   │   ├── GeneralSettings.jsx (28.2KB)
│   │   │   │   │   └── Subscription.jsx (3.6KB)

│   │   │   │   ├── AbandonedTranslations.jsx (7.2KB)
│   │   │   │   ├── AddChapter.js (6.3KB)
│   │   │   │   ├── BookCreate.js (28.0KB)
│   │   │   │   ├── BookDetailOwner.jsx (31.1KB)
│   │   │   │   ├── BookDetailReader.jsx (38.6KB)
│   │   │   │   ├── BookDetailRouter.jsx (6.1KB)
│   │   │   │   ├── Catalog.js (6.5KB)
│   │   │   │   ├── ChapterDetail.js (17.4KB)
│   │   │   │   └── Faq.jsx (1.4KB)

│   │   │   └── utils/
│   │   │       ├── bookUtils.js (1.1KB)
│   │   │       └── errorUtils.js (4.7KB)


│   │   ├── chat/
│   │   │   ├── components/
│   │   │   │   ├── ChatList.js (4.6KB)
│   │   │   │   ├── ChatWindow.js (18.9KB)
│   │   │   │   └── CreateChatModal.js (2.3KB)

│   │   │   ├── css/
│   │   │   │   ├── ChatList.css (3.9KB)
│   │   │   │   ├── ChatPage.css (734.0B)
│   │   │   │   ├── ChatWindow.css (3.2KB)
│   │   │   │   └── CreateChatModal.css (2.4KB)

│   │   │   ├── pages/
│   │   │   │   └── ChatPage.jsx (13.5KB)

│   │   │   ├── services/
│   │   │   │   ├── counterWebSocketService.js (4.5KB)
│   │   │   │   ├── globalWebSocketService.js (4.6KB)
│   │   │   │   └── websocketService.js (19.8KB)

│   │   │   └── chatSlice.js (7.2KB)

│   │   ├── components/
│   │   │   ├── CustomToast/
│   │   │   │   ├── index.js (236.0B)
│   │   │   │   ├── NotificationModal.js (2.7KB)
│   │   │   │   ├── NotificationModal.module.css (6.4KB)
│   │   │   │   ├── README.md (6.0KB)
│   │   │   │   ├── ToastContainer.css (212.0B)
│   │   │   │   └── ToastContext.js (2.8KB)

│   │   │   ├── images/
│   │   │   │   ├── NotificationModal.svg (82.8KB)
│   │   │   │   ├── NotificationModalElement1.svg (13.5KB)
│   │   │   │   ├── NotificationModalElement2.svg (13.5KB)
│   │   │   │   ├── NotificationModalElement3.svg (13.5KB)
│   │   │   │   ├── NotificationModalElement4.svg (13.5KB)
│   │   │   │   ├── NotificationModalElementDn.svg (15.5KB)
│   │   │   │   ├── NotificationModalElementLine2.svg (60.9KB)
│   │   │   │   ├── NotificationModalElementUp.svg (15.5KB)
│   │   │   │   ├── Star_fill_midl.svg (1.6KB)
│   │   │   │   ├── Star_fill_on.svg (1.6KB)
│   │   │   │   └── Star_light_off.svg (1.4KB)

│   │   │   ├── styles/
│   │   │   │   ├── ConfirmationModal.css (3.1KB)
│   │   │   │   └── ExpandableList.css (1.1KB)

│   │   │   ├── ConfirmationModal.js (5.2KB)
│   │   │   ├── ExpandableList.js (2.0KB)
│   │   │   ├── Preloader.css (1.6KB)
│   │   │   ├── Preloader.jsx (202.0B)
│   │   │   ├── Scrollbar.css (954.0B)
│   │   │   ├── ScrollToTop.js (270.0B)
│   │   │   └── ThanksModal.js (6.2KB)

│   │   ├── constants/
│   │   │   └── fallbackImages.js (1.1KB)

│   │   ├── editors/
│   │   │   ├── components/
│   │   │   │   └── ModalErrorReport.js (4.6KB)

│   │   │   ├── pages/
│   │   │   │   └── EditChapter.jsx (8.3KB)

│   │   │   └── styles/
│   │   │       └── ModalErrorReport.css (2.3KB)


│   │   ├── hooks/
│   │   │   ├── useBookAccess.js (1.4KB)
│   │   │   └── useBookAnalytics.js (4.9KB)

│   │   ├── info/
│   │   │   ├── help/
│   │   │   │   ├── faq/
│   │   │   │   │   ├── balance-help.jsx (1.6KB)
│   │   │   │   │   ├── index.jsx (1.8KB)
│   │   │   │   │   └── payments.jsx (1.7KB)

│   │   │   │   ├── contacts.jsx (1.8KB)
│   │   │   │   ├── payment.jsx (2.7KB)
│   │   │   │   ├── say-thanks.jsx (3.7KB)
│   │   │   │   └── support.jsx (2.8KB)

│   │   │   ├── legal/
│   │   │   │   ├── author-agreement.jsx (1.7KB)
│   │   │   │   ├── content-rules.jsx (1.8KB)
│   │   │   │   ├── for-copyright-holders.jsx (1.8KB)
│   │   │   │   ├── privacy-policy.jsx (1.8KB)
│   │   │   │   ├── translator-agreement.jsx (1.8KB)
│   │   │   │   ├── user-agreement.jsx (1.8KB)
│   │   │   │   ├── Для правовласників.docx (11.9KB)
│   │   │   │   ├── Договір Автор-Перекладач.doc (40.0KB)
│   │   │   │   ├── Договір з автором.docx (19.9KB)
│   │   │   │   ├── ПОЛІТИКА КОНФІДЕНЦІЙНОСТІ ТА ЗАХИСТУ ПЕРСОНАЛЬНИХ.docx (13.3KB)
│   │   │   │   ├── Правила розміщення авторського контенту.docx (14.4KB)
│   │   │   │   └── Угода користувача.docx (35.9KB)

│   │   │   ├── index.js (867.0B)
│   │   │   └── README.md (2.4KB)

│   │   ├── main/
│   │   │   ├── assets/
│   │   │   │   ├── 6d160430-b470-4cc1-b10b-62704e42d119.jpg (235.5KB)
│   │   │   │   ├── bg_create_img.svg (1.5KB)
│   │   │   │   ├── book.png (1000.8KB)
│   │   │   │   ├── BookmarksPage.svg (4.6KB)
│   │   │   │   ├── brook.png (1.8KB)
│   │   │   │   ├── burger_border.svg (1.1KB)
│   │   │   │   ├── burger_img_background.svg (26.2KB)
│   │   │   │   ├── burger_img_backgroung.png (335.9KB)
│   │   │   │   ├── ChatVerse.svg (3.0KB)
│   │   │   │   ├── Create book.svg (4.5KB)
│   │   │   │   ├── exit.svg (2.6KB)
│   │   │   │   ├── Group 107.png (30.2KB)
│   │   │   │   ├── notification.svg (3.9KB)
│   │   │   │   ├── Profile.svg (2.0KB)
│   │   │   │   ├── Rectangle.svg (730.0B)
│   │   │   │   ├── UserTranslations.svg (9.4KB)
│   │   │   │   └── VectorHorizontal.png (2.0KB)

│   │   │   ├── components/
│   │   │   │   ├── Burger/
│   │   │   │   │   ├── Burger.js (9.0KB)
│   │   │   │   │   └── Burger.module.css (11.6KB)

│   │   │   │   ├── Header/
│   │   │   │   │   ├── Header.js (3.2KB)
│   │   │   │   │   ├── ProfileImage.js (1.9KB)
│   │   │   │   │   ├── SearchBar.js (1.3KB)
│   │   │   │   │   └── UserMenu.js (10.3KB)

│   │   │   │   ├── BreadCrumb.js (1.4KB)
│   │   │   │   ├── Footer.js (5.0KB)
│   │   │   │   ├── MainPageAdvertisingCarousel.jsx (7.1KB)
│   │   │   │   └── Particle.js (1008.0B)

│   │   │   ├── images/
│   │   │   │   ├── arrow-mobile.svg (350.0B)
│   │   │   │   ├── bg-homepage.svg (2.6MB)
│   │   │   │   ├── hoverMenu.svg (4.6KB)
│   │   │   │   ├── NewBook1.svg (11.7MB)
│   │   │   │   ├── Search_light.svg (251.0B)
│   │   │   │   └── star-header.svg (2.2KB)

│   │   │   ├── pages/
│   │   │   │   ├── img/
│   │   │   │   │   ├── -----------------1.svg (542.0B)
│   │   │   │   │   ├── ----------------.svg (540.0B)
│   │   │   │   │   ├── ------3-1-1.svg (11.7MB)
│   │   │   │   │   ├── ------3-1.svg (11.7MB)
│   │   │   │   │   ├── 18--1.png (2.0KB)
│   │   │   │   │   ├── 1sr-glcht4s-1-1.png (150.1KB)
│   │   │   │   │   ├── 2303-w032-n002-874a-p30-874-2--traced-.svg (4.6KB)
│   │   │   │   │   ├── 3.png (1.0MB)
│   │   │   │   │   ├── 5j2-alde6ls-1@2x.png (209.6KB)
│   │   │   │   │   ├── arrow-chapter.png (698.0B)
│   │   │   │   │   ├── arrow-drop-down-1.svg (340.0B)
│   │   │   │   │   ├── arrow-drop-down.svg (337.0B)
│   │   │   │   │   ├── arrow-name-chapter.png (330.0B)
│   │   │   │   │   ├── bell-light.svg (1.2KB)
│   │   │   │   │   ├── bg-chapter.png (40.9KB)
│   │   │   │   │   ├── bg-create-modal.svg (5.0MB)
│   │   │   │   │   ├── bg-create.svg (39.8MB)
│   │   │   │   │   ├── bg-homepages.svg (308.5KB)
│   │   │   │   │   ├── bg-hover.png (6.7KB)
│   │   │   │   │   ├── bg-modal.svg (308.8KB)
│   │   │   │   │   ├── bg-photo.png (338.7KB)
│   │   │   │   │   ├── bg-profile.png (28.3KB)
│   │   │   │   │   ├── blue-dot.png (774.0B)
│   │   │   │   │   ├── book-homepages.svg (75.5KB)
│   │   │   │   │   ├── border-chat.jpg (13.2KB)
│   │   │   │   │   ├── border-chat.png (7.0KB)
│   │   │   │   │   ├── border-chat.svg (1.4KB)
│   │   │   │   │   ├── border-create.svg (7.9KB)
│   │   │   │   │   ├── border-notification.png (36.9KB)
│   │   │   │   │   ├── border.png (2.3KB)
│   │   │   │   │   ├── CheckSave.png (537.0B)
│   │   │   │   │   ├── closed-eye.png (685.0B)
│   │   │   │   │   ├── comment.jpg (30.3KB)
│   │   │   │   │   ├── Favorite.png (430.0B)
│   │   │   │   │   ├── group-56@2x.png (3.5KB)
│   │   │   │   │   ├── left-arrow.png (2.6KB)
│   │   │   │   │   ├── line-51-1.svg (175.0B)
│   │   │   │   │   ├── line-51-2.svg (188.0B)
│   │   │   │   │   ├── line-51.svg (186.0B)
│   │   │   │   │   ├── line-52.svg (186.0B)
│   │   │   │   │   ├── line-cart-book.svg (183.0B)
│   │   │   │   │   ├── login.png (2.4KB)
│   │   │   │   │   ├── message-light.svg (321.0B)
│   │   │   │   │   ├── message.svg (1.6KB)
│   │   │   │   │   ├── navigation4-1.svg (277.0B)
│   │   │   │   │   ├── navigation4.svg (296.0B)
│   │   │   │   │   ├── navigation5-1.svg (299.0B)
│   │   │   │   │   ├── navigation5.svg (299.0B)
│   │   │   │   │   ├── open-eye.png (638.0B)
│   │   │   │   │   ├── orange-dot.png (753.0B)
│   │   │   │   │   ├── rectangle-6-1.svg (1.0KB)
│   │   │   │   │   ├── rectangle-6.svg (1.1KB)
│   │   │   │   │   ├── right-arrow.png (2.6KB)
│   │   │   │   │   ├── right_light.png (218.0B)
│   │   │   │   │   ├── save.png (384.0B)
│   │   │   │   │   ├── search-light.svg (271.0B)
│   │   │   │   │   ├── star-fill-1.svg (1.6KB)
│   │   │   │   │   ├── star-fill-10.svg (1.6KB)
│   │   │   │   │   ├── star-fill-11.svg (1.6KB)
│   │   │   │   │   ├── star-fill-12.svg (1.6KB)
│   │   │   │   │   ├── star-fill-13.svg (1.6KB)
│   │   │   │   │   ├── star-fill-14.svg (1.6KB)
│   │   │   │   │   ├── star-fill-15.svg (1.6KB)
│   │   │   │   │   ├── star-fill-2.svg (1.6KB)
│   │   │   │   │   ├── star-fill-3.svg (1.6KB)
│   │   │   │   │   ├── star-fill-8.svg (1.6KB)
│   │   │   │   │   ├── star-fill-9.svg (1.6KB)
│   │   │   │   │   ├── star-fill.svg (1.6KB)
│   │   │   │   │   ├── star-light-1.svg (1.4KB)
│   │   │   │   │   ├── star-light-2.svg (1.4KB)
│   │   │   │   │   ├── star-light-3.svg (1.4KB)
│   │   │   │   │   ├── star-light.svg (1.4KB)
│   │   │   │   │   ├── status.png (715.0B)
│   │   │   │   │   ├── Trash.png (370.0B)
│   │   │   │   │   ├── vector-11.svg (183.0B)
│   │   │   │   │   ├── vector-17.svg (513.0B)
│   │   │   │   │   ├── vector-21.svg (482.0B)
│   │   │   │   │   ├── vector-23.svg (482.0B)
│   │   │   │   │   └── vector-24.svg (482.0B)

│   │   │   │   ├── HomePage.jsx (418.0B)
│   │   │   │   ├── HomePage1.jsx (8.3KB)
│   │   │   │   ├── HomePage2.jsx (9.9KB)
│   │   │   │   ├── HomePage3.jsx (7.8KB)
│   │   │   │   ├── MagicalGuide.js (428.0B)
│   │   │   │   ├── MagicalGuide1.js (4.2KB)
│   │   │   │   └── MagicalGuide2.js (4.4KB)

│   │   │   └── styles/
│   │   │       ├── Breadcrumb.module.css (453.0B)
│   │   │       ├── Footer.css (2.4KB)
│   │   │       ├── Header.css (10.5KB)
│   │   │       ├── HomePage.css (250.0B)
│   │   │       ├── HomePage1.css (7.2KB)
│   │   │       ├── HomePage2.css (13.3KB)
│   │   │       ├── HomePage3.css (3.5KB)
│   │   │       ├── MagicalGuide.css (4.5KB)
│   │   │       └── NovelDetails.module.css (2.9KB)


│   │   ├── navigation/
│   │   │   ├── components/
│   │   │   │   ├── BookmarkButton.jsx (3.6KB)
│   │   │   │   ├── ChapterNavigation.js (5.7KB)
│   │   │   │   ├── ChapterRangeSelector.css (893.0B)
│   │   │   │   └── ChapterRangeSelector.js (1.2KB)

│   │   │   ├── css/
│   │   │   │   ├── BookmarkButton.css (1.6KB)
│   │   │   │   └── BookmarksPage.css (7.7KB)

│   │   │   └── styles/
│   │   │       └── BookmarkButton.css (824.0B)


│   │   ├── notification/
│   │   │   ├── components/
│   │   │   │   ├── ModalErrorNotification.js (3.3KB)
│   │   │   │   └── NotificationItem.js (4.4KB)

│   │   │   ├── pages/
│   │   │   │   └── NotificationPage.jsx (10.2KB)

│   │   │   ├── styles/
│   │   │   │   ├── ModalErrorNotification.css (1.8KB)
│   │   │   │   ├── NotificationItem.css (1.8KB)
│   │   │   │   └── NotificationPage.css (4.5KB)

│   │   │   └── notificationSlice.js (7.1KB)

│   │   ├── rating/
│   │   │   ├── components/
│   │   │   │   └── BookRatingComponent.jsx (10.0KB)

│   │   │   ├── styles/
│   │   │   │   └── BookRatingComponent.module.css (1.1KB)

│   │   │   └── utils/
│   │   │       └── requestThrottle.js (3.5KB)


│   │   ├── reviews/
│   │   │   ├── components/
│   │   │   │   └── CommentSection.js (17.1KB)

│   │   │   └── style/


│   │   ├── search/
│   │   │   ├── components/

│   │   │   ├── pages/
│   │   │   │   └── SearchPage.jsx (28.7KB)

│   │   │   └── styles/
│   │   │       └── Search.css (1.6KB)


│   │   ├── settings/
│   │   │   └── userSettingsSlice.js (580.0B)

│   │   ├── site/
│   │   │   ├── about/
│   │   │   │   ├── pages/

│   │   │   │   └── styles/


│   │   │   ├── knowledge-base/
│   │   │   │   ├── pages/

│   │   │   │   └── styles/


│   │   │   └── trust-center/
│   │   │       └── styles/



│   │   ├── users/
│   │   │   ├── components/
│   │   │   │   ├── ModalAdultContent.js (2.1KB)
│   │   │   │   ├── ModalDepositBalance.js (2.8KB)
│   │   │   │   ├── ModalTransactionHistory.js (2.7KB)
│   │   │   │   └── ModalWithdrawBalance.js (3.0KB)

│   │   │   ├── css/
│   │   │   │   └── Profile.css (9.0KB)

│   │   │   ├── pages/
│   │   │   │   ├── AdvertisementsUsers.jsx (4.4KB)
│   │   │   │   ├── Authors.jsx (6.8KB)
│   │   │   │   ├── BookmarksPage.jsx (20.5KB)
│   │   │   │   ├── Profile.js (47.7KB)
│   │   │   │   ├── ProfilesUsers.jsx (2.7KB)
│   │   │   │   ├── TranslatorsList.js (7.2KB)
│   │   │   │   └── UserTranslations.js (12.2KB)

│   │   │   └── styles/
│   │   │       ├── AdvertisementsUsers.css (4.0KB)
│   │   │       ├── ModalAdultContent.css (3.0KB)
│   │   │       ├── ModalBalance.css (3.0KB)
│   │   │       ├── ProfilesUsers.css (158.0B)
│   │   │       ├── rectangle.svg (954.0B)
│   │   │       └── TranslatorsList.css (9.5KB)


│   │   ├── utils/
│   │   │   ├── errorHandler.js (5.3KB)
│   │   │   ├── retryUtils.js (1.8KB)
│   │   │   └── withVersion.js (352.0B)

│   │   ├── website_advertising/
│   │   │   ├── pages/
│   │   │   │   └── AdvertisementSettings.jsx (11.4KB)

│   │   │   ├── styles/
│   │   │   │   └── AdvertisementSettings.css (2.6KB)

│   │   │   └── website_advertising_main.js (0B)

│   │   ├── App.jsx (10.7KB)
│   │   ├── index.css (2.4KB)
│   │   ├── index.jsx (613.0B)
│   │   ├── reportWebVitals.js (375.0B)
│   │   └── store.js (499.0B)

│   ├── .gitignore (200.0B)
│   ├── index.html (484.0B)
│   ├── package-lock.json (672.2KB)
│   ├── package.json (1.4KB)
│   ├── tailwind.config.js (239.0B)
│   └── vite.config.ts (808.0B)

├── project_documentation/
│   ├── api_endpoints.md (11.6KB)
│   ├── authentication_system.md (11.0KB)
│   ├── BookCreationIntegration.md (9.1KB)
│   ├── books_news_algorithm.md (7.7KB)
│   ├── CHANGELOG.md (2.3KB)
│   ├── nginx_configuration.md (8.6KB)
│   ├── project_overview.md (18.9KB)
│   ├── README.md (4.2KB)
│   ├── site_tree.md (16.5KB)
│   ├── throttling_system.md (12.0KB)
│   └── troubleshooting_guide.md (6.8KB)

├── .gitattributes (185.0B)
├── .gitignore (1.9KB)
├── generate_site_tree.py (7.4KB)
├── README.md (7.3KB)
└── tree.bat (245.0B)

```

## Топ-10 самых больших файлов

- `frontend\src\main\pages\img\bg-create.svg` - 39.8MB
- `backend\media\books\eefoewfkn\fairytale-scene-coming-out-book_1.jpg` - 14.3MB
- `frontend\src\main\pages\img\------3-1.svg` - 11.7MB
- `frontend\src\main\pages\img\------3-1-1.svg` - 11.7MB
- `frontend\src\main\images\NewBook1.svg` - 11.7MB
- `frontend\src\main\pages\img\bg-create-modal.svg` - 5.0MB
- `frontend\src\main\images\bg-homepage.svg` - 2.6MB
- `backend\media\books\test-2\chapters\html\akpuavtsuaui.html` - 2.6MB
- `frontend\src\assets\images\logo\logo2.0.png` - 2.0MB
- `backend\media\books\test-2\chapters\И_что_с_того_что_это_RPG_мир.docx` - 1.3MB

## Статистика по типам файлов

- **.py:** 222 файлов
- **.svg:** 104 файлов
- **.js:** 83 файлов
- **.docx:** 73 файлов
- **.html:** 69 файлов
- **.png:** 58 файлов
- **.css:** 49 файлов
- **.jsx:** 44 файлов
- **.jpg:** 16 файлов
- **.md:** 14 файлов
- **.json:** 3 файлов
- **.ttf:** 3 файлов
- **.txt:** 2 файлов
- **.bat:** 1 файлов
- **без расширения:** 1 файлов
- **.conf:** 1 файлов
- **.ts:** 1 файлов
- **.webp:** 1 файлов
- **.ico:** 1 файлов
- **.woff:** 1 файлов

## Исключенные папки

Следующие папки и их содержимое исключены из дерева:
- `venv/` - виртуальное окружение Python
- `node_modules/` - зависимости Node.js
- `__pycache__/` - кэш Python
- `.git/` - репозиторий Git
- `build/`, `dist/` - собранные файлы
- `staticfiles/` - статические файлы Django
- `media/` - медиа файлы
- `migrations/` - миграции Django
- Другие служебные папки и файлы

---
*Сгенерировано скриптом generate_site_tree.py*
