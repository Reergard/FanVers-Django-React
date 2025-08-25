import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, deleteNotification, markNotificationAsRead } from "../notificationSlice";
import ModalAdultContent from '../../users/components/ModalAdultContent';
import { setHideAdultContent } from "../../settings/userSettingsSlice";
import { Form } from "react-bootstrap";
import "../styles/NotificationPage.css";
import { toast } from "react-toastify";
import { BreadCrumb } from '../../main/components/BreadCrumb';
import BgModal from '../../main/pages/img/bg-modal.svg';

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

  const hideAdultContent = useSelector(
    (state) => state.userSettings.hideAdultContent
  );
  const [showAdultContentModal, setShowAdultContentModal] = useState(false);
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector(
    (state) => state.notification
  );

  // Загружаем уведомления при монтировании компонента
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Автоматически помечаем уведомления как прочитанные при загрузке страницы
  useEffect(() => {
    if (notifications.length > 0) {
      const unreadNotifications = notifications.filter(notification => !notification.is_read);
      if (unreadNotifications.length > 0) {
        // Помечаем все непрочитанные уведомления как прочитанные
        unreadNotifications.forEach(notification => {
          dispatch(markNotificationAsRead(notification.id));
        });
      }
    }
  }, [notifications, dispatch]);

  const handleDeleteNotification = async (notificationId) => {
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
      toast.success("Повідомлення видалено");
    } catch (error) {
      toast.error("Помилка при видаленні повідомлення");
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

  if (loading && notifications.length === 0) {
    return <div className="notifications-loading">Завантаження...</div>;
  }

  if (error) {
    return <div className="notifications-error">{error}</div>;
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
    if (notifications.length === 0) {
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

    return notifications.map((notification, index) => (
      <div key={notification.id} className="one-notification">
        <div className="header-one-notification">
          Повідомлення {index + 1}
        </div>
        <div className="block-text-one-notification">
          <div className="text-one-notification">
            {notification.message}
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
    ));
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
          <span>Показано {notifications.length} сповіщення</span>
          {isMobile ? (
            <button onClick={() => setShowFilters(true)}>Фільтри</button>
          ) : null}
        </div>
        <div className="all-content-notifications">
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
          <div className="text-notifications">
            {renderNotifications()}
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
