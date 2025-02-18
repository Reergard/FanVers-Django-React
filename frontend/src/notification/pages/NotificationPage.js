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

const NotificationPage = () => {
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
        </div>
        <div className="all-content-notifications">
          <div className="nav-notifications">
            <div className="header-nav-notifications">Повідомлення</div>
            <div className="content-nav-notifications">
              {" "}
              <Form.Check
                type="checkbox"
                id="hide-adult-content"
                label="Помилка у тексті"
                // checked={hideAdultContent}
                // onChange={handleAdultContentChange}
                className="adult-content-checkbox"
              />
              <Form.Check
                type="checkbox"
                id="hide-adult-content"
                label="Передача перекладу іншому"
                // checked={hideAdultContent}
                // onChange={handleAdultContentChange}
                className="adult-content-checkbox"
              />
              <Form.Check
                type="checkbox"
                id="hide-adult-content"
                label="Отримання перекладу від іншого"
                // checked={hideAdultContent}
                // onChange={handleAdultContentChange}
                className="adult-content-checkbox"
              />
              <Form.Check
                type="checkbox"
                id="hide-adult-content"
                label="Зміна статусу замовлення реклами у соцмережах"
                // checked={hideAdultContent}
                // onChange={handleAdultContentChange}
                className="adult-content-checkbox"
              />
              <Form.Check
                type="checkbox"
                id="hide-adult-content"
                label="Вихід нових розділів"
                // checked={hideAdultContent}
                // onChange={handleAdultContentChange}
                className="adult-content-checkbox"
              />
              <Form.Check
                type="checkbox"
                id="hide-adult-content"
                label="Новий розділ у перекладі"
                // checked={hideAdultContent}
                // onChange={handleAdultContentChange}
                className="adult-content-checkbox"
              />
              <Form.Check
                type="checkbox"
                id="hide-adult-content"
                label="Зміна статусу перекладу"
                // checked={hideAdultContent}
                // onChange={handleAdultContentChange}
                className="adult-content-checkbox"
              />
              <Form.Check
                type="checkbox"
                id="hide-adult-content"
                label="Зняття розділу з передплати"
                // checked={hideAdultContent}
                // onChange={handleAdultContentChange}
                className="adult-content-checkbox"
              />
              <Form.Check
                type="checkbox"
                id="hide-adult-content"
                label="Коментар до глави"
                // checked={hideAdultContent}
                // onChange={handleAdultContentChange}
                className="adult-content-checkbox"
              />
              <Form.Check
                type="checkbox"
                id="hide-adult-content"
                label="Коментар до книги"
                // checked={hideAdultContent}
                // onChange={handleAdultContentChange}
                className="adult-content-checkbox"
              />
            </div>
            <div className="footer-nav-notifications">
              <button className="save-email">
                <img src={Save} />
                <span>Зберегти</span>
              </button>
            </div>
          </div>
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
          </div>
        </div>
        {/* <div className="notifications-list">
                {notifications.length === 0 ? (
                    <p className="no-notifications">Немає нових повідомлень</p>
                ) : (
                    notifications.map(notification => (
                        <NotificationItem 
                            key={`notification-${notification.id}`}
                            notification={notification}
                            onMarkAsRead={handleMarkAsRead}
                        />
                    ))
                )}
            </div> */}
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
