import React, { useState, useRef, useEffect } from 'react';
import { ProfileImage } from './ProfileImage';
import NotificationBell from '../../../assets/images/icons/notification-bell.svg';
import image_messages from '../../../assets/images/icons/profile-decoration-2.svg';
import profile_menu from '../../../assets/images/icons/profile-menu.svg';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../users/auth/authSlice';
import LoginModal from '../../../users/auth/LoginModal';
import RegisterModal from '../../../users/auth/RegisterModal';
import { toast } from 'react-toastify';
import { authAPI } from '../../../api';

export const UserMenu = ({ name, socialIcons, unreadNotifications }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const menuRef = useRef(null);
    const { isAuthenticated, userInfo } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const listener = (event) => {
            if (!menuRef.current || menuRef.current.contains(event.target)) {
                return;
            }
            setIsMenuOpen(false);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [menuRef]);

    const handleMenuClick = () => {
      setIsMenuOpen(!isMenuOpen);
    };

    const profileData = {
      name: name,
      images: [
        {
            src: NotificationBell,
            className: "notification-bell",
            alt: "Notifications",
            badge: unreadNotifications > 0 ? unreadNotifications : null
        },
        {
          src: image_messages,
          className: "image_messages",
          alt: "image-messages",
          badge: null
        },
        {
          src: "https://cdn.builder.io/api/v1/image/assets/TEMP/cfd29db4f289462c4c4ffabab1fd7da0c05f5524b6440688180ef5f3c986968c",
          className: "profile-image profile-image--third",
          alt: "Profile decoration 3",
          badge: null
        },       
      ]
    };
  
    const handleLogout = async () => {
        try {
            dispatch(logout());
            
            localStorage.removeItem('token');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user');
            
            toast.success('Ви успішно вийшли з системи');
            navigate('/');
        } catch (error) {
            toast.error('Помилка при виході з системи');
            console.error('Logout error:', error);
        }
    };

    const menuItems = [
        { text: 'Власні переклади', href: '/my-translations', icon: '📚' },
        { text: 'Створити переклад', href: '/create-translation', icon: '✏️' },
        { text: 'Закладки', href: '/bookmarks', icon: '🔖' },
        { text: 'Профіль', href: '/profile', icon: '👤' },
        { text: 'Вийти', href: '/logout', icon: '🚪', onClick: handleLogout },
    ];

    if (!isAuthenticated) {
        return (
            <section className="user-profile">
                <button 
                    className="auth-button login-button"
                    onClick={() => setIsLoginModalOpen(true)}
                >
                    Вхід
                </button>
                <button 
                    className="auth-button register-button"
                    onClick={() => setIsRegisterModalOpen(true)}
                >
                    Реєстрація
                </button>

                <LoginModal 
                    isOpen={isLoginModalOpen}
                    onRequestClose={() => setIsLoginModalOpen(false)}
                />
                <RegisterModal 
                    isOpen={isRegisterModalOpen}
                    onRequestClose={() => setIsRegisterModalOpen(false)}
                />
            </section>
        );
    }
  
    return (
      <section className="user-profile">
        {profileData.images.map((image, index) => (
          <ProfileImage key={index} {...image} />
        ))}
        {userInfo && userInfo.username && (
          <span className="user-profile__name">{userInfo.username}</span>
        )}
        <div className="user-profile__menu-container" ref={menuRef}>
          <button 
            className="user-profile__menu-button"
            onClick={handleMenuClick}
            aria-expanded={isMenuOpen}
            aria-label="Відкрити меню користувача"
          >
            <img src={profile_menu} alt="Меню користувача" />
          </button>
          {isMenuOpen && (
            <nav className="user-profile__dropdown-menu">
              <ul className="user-profile__menu-list">
                {menuItems.map((item, index) => (
                  <li key={index} className="user-profile__menu-item">
                    {item.onClick ? (
                      <button 
                        className="user-profile__menu-link"
                        onClick={item.onClick}
                      >
                        <span className="user-profile__menu-icon">{item.icon}</span>
                        <span className="user-profile__menu-text">{item.text}</span>
                      </button>
                    ) : (
                      <Link 
                        to={item.href} 
                        className="user-profile__menu-link"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="user-profile__menu-icon">{item.icon}</span>
                        <span className="user-profile__menu-text">{item.text}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>
    );
};