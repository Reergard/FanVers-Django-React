import { useState, forwardRef, useImperativeHandle } from "react";
import styles from "./Burger.module.css";
import { ProfileImage } from "../Header/ProfileImage";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../auth/authSlice';
import { toast } from 'react-toastify';
import { FALLBACK_IMAGES, IMAGE_SIZES } from '../../../constants/fallbackImages';

// Импорт SVG иконок
import exitIcon from '../../assets/exit.svg';
import userTranslationsIcon from '../../assets/UserTranslations.svg';
import profileIcon from '../../assets/Profile.svg';
import notificationIcon from '../../assets/notification.svg';
import bookmarksIcon from '../../assets/BookmarksPage.svg';
import createBookIcon from '../../assets/Create book.svg';
import chatVerseIcon from '../../assets/ChatVerse.svg';

const BurgerMenu = forwardRef(function BurgerMenu(_, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  
  // Открытие/закрытие извне
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
  }));

  const handleLogout = async () => {
    try {
      dispatch(logout());
      
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      
      toast.success('Ви успішно вийшли з системи');
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      toast.error('Помилка при виході з системи');
      console.error('Logout error:', error);
    }
  };
  
  const menuItems = [
    { key:'userTranslations', text: 'Власні переклади', href: '/User-translations', icon: userTranslationsIcon },
    { key:'bookmarks',        text: 'Закладки',         href: '/bookmarks',          icon: bookmarksIcon },
    { key:'chatverse',        text: 'ChatVerse',        href: '/chat',               icon: chatVerseIcon },
    { key:'notification',     text: 'Сповіщення',       href: '/notification',       icon: notificationIcon },
    { key:'profile',          text: 'Профіль',          href: '/profile',            icon: profileIcon },
    { key:'exit',             text: 'Вийти',            icon: exitIcon,              onClick: handleLogout },
  ];
  
  return (
    <div className={`${styles.burger_menu} ${isOpen ? styles.active : ''}`}>
      {/* Бургер-кнопка видна только на мобайле (CSS), на десктопе скрыта */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.burger_menu_button}
        aria-label={isOpen ? "Закрити меню" : "Відкрити меню"}
      >
        <span className={`${styles.burger_line} ${styles.burger_line_1} ${isOpen ? styles.burger_line_active_1 : ""}`} />
        <span className={`${styles.burger_line} ${styles.burger_line_2} ${isOpen ? styles.burger_line_active_2 : ""}`} />
        <span className={`${styles.burger_line} ${styles.burger_line_3} ${isOpen ? styles.burger_line_active_3 : ""}`} />
      </button>

      {isOpen && (
        <div
          className={styles.burger_menu__content}
          role="dialog"
          aria-modal="true"
        >
          {/* Кнопка закрытия для десктопа */}
          <button
            className={styles.close_button}
            onClick={() => setIsOpen(false)}
            aria-label="Закрити меню"
            type="button"
          >
            ×
          </button>

          {/* Аватар пользователя */}
          <ProfileImage
            src={currentUser?.profile_image_large || currentUser?.image}
            alt="Profile"
            className={styles.profile_avatar}
            size={IMAGE_SIZES.USER_MENU_AVATAR}
            fallbackLarge={FALLBACK_IMAGES.LARGE}
            fallbackSmall={FALLBACK_IMAGES.SMALL}
          />

          <div className={styles.create_book__block}>
            <div 
              className={styles.create_book}
              onClick={() => {
                window.location.href = '/create-translation';
                setIsOpen(false);
              }}
              style={{ cursor: 'pointer' }}
            >
              <img src={createBookIcon} alt="" className={`${styles.create_book_icon} ${styles.icon_create}`} loading="lazy" />
              Створити книгу
            </div>
            <ul className={styles.ul_burger_menu}>
              {menuItems.map((item, index) => (
                <li key={index} className={styles.menu_item}>
                  {item.onClick ? (
                    <button
                      onClick={() => {
                        item.onClick();
                      }}
                      className={styles.menu_button}
                    >
                      <img
                        src={item.icon}
                        alt=""
                        className={`${styles.menu_icon} ${styles['icon_'+item.key] || ''}`}
                        loading="lazy"
                      />
                      {item.text}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={styles.menu_link}
                    >
                      <img
                        src={item.icon}
                        alt=""
                        className={`${styles.menu_icon} ${styles['icon_'+item.key] || ''}`}
                        loading="lazy"
                      />
                      {item.text}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});

export default BurgerMenu;
