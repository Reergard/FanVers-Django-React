import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, deleteNotification, markNotificationAsRead } from "../notificationSlice";
import ModalAdultContent from '../../users/components/ModalAdultContent';
import { setHideAdultContent } from "../../settings/userSettingsSlice";
import { Form } from "react-bootstrap";
import "../styles/NotificationPage.css";
import { useToast } from '../../components/CustomToast';
import { BreadCrumb } from '../../main/components/BreadCrumb';

const notificationsList = [
  "Помилка у тексті",
  "Передача перекладу іншому",
  "Отримання перекладу від іншого",
  "Зміна статусу замовлення реклами у соцмережах",
  "Вихід нових розділів",
  "Новий розділ у перекладі",
  "Зміна статусу перекладу",
  "Зняття розділу з передплати",
  "Коментар до глави",
  "Коментар до книги",
];

const NotificationPage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1005);
  const [showFilters, setShowFilters] = useState(false);
  const { success, error: showError } = useToast();
  const fetchedRef = useRef(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1005);
      if (window.innerWidth > 1005) {
        setShowFilters(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [showAdultContentModal, setShowAdultContentModal] = useState(false);
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector(
    (state) => state.notification
  );
  const { isAuthenticated, isLoading: authLoading } = useSelector(
    (state) => state.auth
  );

  // Загружаем уведомления при монтировании компонента
  useEffect(() => {
    // Ждем готовности авторизации
    if (authLoading || !isAuthenticated) return;
    
    // Одноразовый предохранитель от двойного вызова в StrictMode
    if (fetchedRef.current) return;
    
    // Загружаем только если уведомлений еще нет
    if (notifications.length === 0 && !loading) {
      fetchedRef.current = true;
      
      const loadNotifications = async () => {
        try {
          console.log(`🔄 [NotificationPage] Начинаем загрузку уведомлений...`);
          await dispatch(fetchNotifications()).unwrap();
          console.log(`✅ [NotificationPage] Уведомления успешно загружены`);
        } catch (error) {
          console.error('❌ [NotificationPage] Ошибка загрузки уведомлений:', error);
        }
      };
      
      loadNotifications();
    }
  }, [dispatch, notifications.length, loading, authLoading, isAuthenticated]);

  // Сбрасываем флажок при логауте
  useEffect(() => {
    if (!isAuthenticated) {
      fetchedRef.current = false;
    }
  }, [isAuthenticated]);

  // Автоматически помечаем уведомления как прочитанные при загрузке страницы
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const unreadNotifications = notifications.filter(notification => 
        notification && !notification.is_read
      );
      
      console.log(`📊 [NotificationPage] Текущее состояние уведомлений:`);
      console.log(`📊 [NotificationPage] Всего: ${notifications.length}`);
      console.log(`📊 [NotificationPage] Непрочитанных: ${unreadNotifications.length}`);
      console.log(`📊 [NotificationPage] Прочитанных: ${notifications.length - unreadNotifications.length}`);
      
      if (unreadNotifications.length > 0) {
        console.log(`🔄 [NotificationPage] Помечаем ${unreadNotifications.length} уведомлений как прочитанные...`);
        // Помечаем все непрочитанные уведомления как прочитанные
        unreadNotifications.forEach(notification => {
          if (notification && notification.id) {
            dispatch(markNotificationAsRead(notification.id));
          }
        });
      }
    }
  }, [notifications, dispatch]);

  const handleDeleteNotification = async (notificationId) => {
    try {
      console.log(`🗑️ [NotificationPage] Удаляем уведомление ID: ${notificationId}`);
      await dispatch(deleteNotification(notificationId)).unwrap();
      console.log(`✅ [NotificationPage] Уведомление успешно удалено`);
      success("Повідомлення видалено");
    } catch (error) {
      console.error(`❌ [NotificationPage] Ошибка удаления уведомления:`, error);
      showError("Помилка при видаленні повідомлення");
    }
  };

  const handleAdultContentChange = (e) => {
    if (e.target.checked) {
      setShowAdultContentModal(true);
    } else {
      dispatch(setHideAdultContent(false));
    }
  };

  const handleConfirmAdultContent = () => {
    dispatch(setHideAdultContent(true));
    setShowAdultContentModal(false);
  };

  // Показываем загрузку если авторизация еще не завершена
  if (authLoading || (loading && notifications.length === 0)) {
    return <div className="notifications-loading">Завантаження...</div>;
  }

  if (error) {
    return (
      <div className="notifications-error">
        <p>Помилка завантаження повідомлень: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            marginTop: '10px', 
            padding: '5px 10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Спробувати знову
        </button>
      </div>
    );
  }

  const renderCheckboxes = () =>
    notificationsList.map((label, index) => (
      <Form.Check
        key={index}
        type="checkbox"
        label={label}
        className="adult-content-checkbox"
      />
    ));

  const renderNotifications = () => {
    if (!notifications || notifications.length === 0) {
      return (
        <div className="one-notification">
          <div className="header-one-notification">Немає повідомлень</div>
          <div className="block-text-one-notification">
            <div className="text-one-notification">
              У вас поки немає повідомлень
            </div>
          </div>
        </div>
      );
    }

    return notifications.map((notification, index) => {
      if (!notification || !notification.id) {
        return null;
      }
      
      return (
        <div key={notification.id} className="one-notification">
          <div className="header-one-notification">
            Повідомлення {index + 1}
          </div>
          <div className="block-text-one-notification">
            <div className="text-one-notification">
              {notification.message || 'Немає тексту повідомлення'}
            </div>
            <div className="buttons-notification">
              <div 
                className="right-button-notification"
                onClick={() => handleDeleteNotification(notification.id)}
                style={{ cursor: 'pointer' }}
              >
                Видалити
              </div>
            </div>
          </div>
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <>
      <BreadCrumb
        items={[
          { href: "/", label: "Головна" },
          { href: "/notification", label: "Повідомлення" },
        ]}
      />
      <div className="notifications-page">
        <div className="headerNotification">
          <span>Показано {notifications ? notifications.length : 0} сповіщення</span>
          {isMobile ? (
            <button onClick={() => setShowFilters(true)}>Фільтри</button>
          ) : null}
        </div>
        <div className="notifications-container">
          {!isMobile && (
            <div className="nav-notifications">
              <div className="header-nav-notifications">Повідомлення</div>
              <div className="content-nav-notifications">
                {renderCheckboxes()}
              </div>
              <div className="footer-nav-notifications">
                <button className="save-email">
                  <span>Зберегти</span>
                </button>
              </div>
            </div>
          )}
          {isMobile && showFilters && (
            <div className="modal-overlay notifications">
              <div className="nav-notifications modal">
                <div className="modal-header">
                  <span>Фільтри</span>
                  <button
                    className="close-btn"
                    onClick={() => setShowFilters(false)}
                  >
                    ✖️
                  </button>
                </div>
                <div className="content-nav-notifications">
                  {renderCheckboxes()}
                </div>
                <div className="footer-nav-notifications">
                  <button className="save-email">
                    <span>Зберегти</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="all-content-notifications">
            <div className="text-notifications">
              {renderNotifications()}
            </div>
          </div>
        </div>

        <ModalAdultContent
          show={showAdultContentModal}
          onHide={() => setShowAdultContentModal(false)}
          onConfirm={handleConfirmAdultContent}
        />
      </div>
    </>
  );
};

export default NotificationPage;
