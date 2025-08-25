import React, { useState, useEffect } from 'react';
import { ProfileImage } from './ProfileImage';
import NotificationBell from '../../../assets/images/icons/notification-bell.svg';
import image_messages from '../../../assets/images/icons/profile-decoration-2.svg';
import profile_menu from '../../../assets/images/icons/profile-menu.svg';
import { useSelector } from 'react-redux';
import LoginModal from '../../../auth/components/LoginModal';
import RegisterModal from '../../../auth/components/RegisterModal';
import { FALLBACK_IMAGES } from '../../../constants/fallbackImages';

import { usersAPI } from '../../../api/users/usersAPI';

export const UserMenu = ({ name, unreadNotifications, onOpenMenu }) => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
    const { isAuthenticated } = useSelector(state => state.auth);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const profile = useSelector(state => state.auth.user);

    // Загружаем баланс пользователя при авторизации
    useEffect(() => {
        if (isAuthenticated && currentUser) {
            const fetchBalance = async () => {
                try {
                    const balanceData = await usersAPI.getUserBalance();
                    setUserBalance(balanceData.balance || 0);
                } catch (error) {
                    console.error('Ошибка при загрузке баланса:', error);
                    // Если не удалось загрузить баланс, используем значение из localStorage
                    setUserBalance(currentUser.balance || 0);
                }
            };
            fetchBalance();
        }
    }, [isAuthenticated, currentUser, profile]);

    const profileData = {
      name: name,
      images: [
        {
            src: NotificationBell,
            className: "notification-bell",
            alt: "Notifications",
            badge: unreadNotifications > 0 ? unreadNotifications : null,
            bg: '#05B4C7',
            style: {width: '43px', height: '38px'}
        },
        {
          src: image_messages,
          className: "image_messages",
          alt: "image-messages",
          badge: null,
          bg: 'yellow',
          style: {width: '43px', height: '38px'}
        },
        {
          // Використовуємо нові поля API для fallback зображень
          src: currentUser?.profile_image_large || currentUser?.image,
          className: `profile-image profile-image--third ${currentUser?.has_custom_image ? 'custom' : ''}`,
          alt: "Profile",
          badge: null,
          size: 'large', // Для UserMenu використовуємо великий розмір
          fallbackLarge: FALLBACK_IMAGES.LARGE, // ghost_full.png для великого розміру
          fallbackSmall: FALLBACK_IMAGES.SMALL // ghost.png для маленького розміру
        },
      ]
    };

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
        {profileData.images.map((image, index) => {
            const key = image.alt || image.className || index;

            const isBell = image.className === 'notification-bell';
            const isMail = image.className === 'image_messages';

            if (isBell || isMail) {
                const goTo = isBell ? '/notification' : '/chat';
                return (
                    <div
                        key={key}
                        className={`${image.className}__parent`}
                        onClick={(e) => { e.stopPropagation(); window.location.href = goTo; }}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{ position: 'relative' }} // для корректного позиционирования бейджа
                    >
                        <ProfileImage {...image} />
                        {image.badge ? (
                            <span className="badge_value" style={{ backgroundColor: image.bg }}>
                                {image.badge}
                            </span>
                        ) : null}
                    </div>
                );
            }

            // Аватар — по клику открывает меню
            return (
                <div
                    key={key}
                    onClick={onOpenMenu}
                    style={{ cursor: 'pointer', display: 'contents' }}
                >
                    <ProfileImage {...image} />
                </div>
            );
        })}
        <div 
            className="user-profile__clickable-area"
            onClick={onOpenMenu}
            style={{ cursor: 'pointer' }}
        >
            <div>
                {currentUser && currentUser?.username && (
                    <span className="user-profile__name">{currentUser.username}</span>
                )}
                <div className="user-profile__balance">
                    FanCoins: <span>{userBalance > 0 ? userBalance.toFixed(2) : '0.00'}</span>
                </div>
            </div>
        </div>
        <div className="user-profile__menu-container">
          <button 
            className="user-profile__menu-button"
            onClick={onOpenMenu}
            aria-label="Відкрити меню користувача"
            type="button"
          >
            <img src={profile_menu} alt="Меню користувача" />
          </button>
        </div>
      </section>
    );
};