import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../notificationSlice";
import ModalAdultContent from "../../users/components/ModalAdultContent";
import { setHideAdultContent } from "../../settings/userSettingsSlice";
import { Form } from "react-bootstrap";
import NotificationItem from "../components/NotificationItem";
import "../styles/NotificationPage.css";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { BreadCrumb } from "../../main/components/BreadCrumb";
import Save from "../../main/pages/img/save.png";
import BgModal from "../../main/pages/img/bg-modal.svg";


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
        setShowFilters(false); // Если расширили экран, скрываем модальное окно
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

  const handleMarkAsRead = useCallback(
    async (notificationId) => {
      try {
        await dispatch(markNotificationAsRead(notificationId)).unwrap();
      } catch (error) {
        toast.error("Помилка при позначенні повідомлення як прочитаного");
      }
    },
    [dispatch]
  );
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

  //   const debouncedFetch = useCallback(
  //     debounce(() => {
  //       dispatch(fetchNotifications());
  //     }, 300),
  //     [dispatch]
  //   );

  //   useEffect(() => {
  //     let intervalId;

  //     const initFetch = () => {
  //       debouncedFetch();
  //       intervalId = setInterval(debouncedFetch, 30000);
  //     };

  //     initFetch();

  //     return () => {
  //       if (intervalId) clearInterval(intervalId);
  //       debouncedFetch.cancel();
  //     };
  //   }, [debouncedFetch]);

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
          <span>Показано 4 сповіщення</span>
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
            <div className="one-notification">
              <div className="header-one-notification">Повідомлення 1</div>
              <div className="block-text-one-notification">
                {" "}
                <div className="text-one-notification">
                  Вітання. Добро пожалувати в систему перекладів «UA Translate».
                  Цей сайт призначений для професійних мов любительських
                  перекладів будь-яких новелів, фанфіків, ранобе з різних мов.
                </div>
                <div className="buttons-notification">
                  <div className="left-button-notification">
                    Позначити як прочитане
                  </div>
                  <div className="right-button-notification">Видалити</div>
                </div>
              </div>
            </div>
            <div className="one-notification">
              <div className="header-one-notification">Повідомлення 1</div>
              <div className="block-text-one-notification">
                {" "}
                <div className="text-one-notification">
                  Вітання. Добро пожалувати в систему перекладів «UA Translate».
                  Цей сайт призначений для професійних мов любительських
                  перекладів будь-яких новелів, фанфіків, ранобе з різних мов.
                </div>
                <div className="buttons-notification">
                  <div className="left-button-notification">
                    Позначити як прочитане
                  </div>
                  <div className="right-button-notification">Видалити</div>
                </div>
              </div>
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

// checked={hideAdultContent}
// onChange={handleAdultContentChange}
