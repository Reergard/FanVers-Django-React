import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ProfileImage } from './ProfileImage';
import NotificationBell from '../../../assets/images/icons/notification-bell.svg';
import image_messages from '../../../assets/images/icons/profile-decoration-2.svg';
import profile_menu from '../../../assets/images/icons/profile-menu.svg';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../auth/authSlice';
import LoginModal from '../../../auth/components/LoginModal';
import RegisterModal from '../../../auth/components/RegisterModal';
import { toast } from 'react-toastify';
import { FALLBACK_IMAGES, IMAGE_SIZES } from '../../../constants/fallbackImages';
import { usersAPI } from '../../../api/users/usersAPI';

export const UserMenu = ({ name, unreadNotifications }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [lastBalanceUpdate, setLastBalanceUpdate] = useState(0);
    const [hasInitialBalance, setHasInitialBalance] = useState(false);
    const menuRef = useRef(null);
    const { isAuthenticated } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Дебаунс для обновления баланса (минимум 5 секунд между обновлениями)
    const BALANCE_UPDATE_COOLDOWN = 5000;

    // Функция для обновления баланса с useCallback (только по требованию)
    const updateBalance = useCallback(async () => {
        const now = Date.now();
        
        // Защита от множественных вызовов и дебаунс
        if (isLoadingBalance || !isAuthenticated || !currentUser) {
            return;
        }
        
        // Проверяем дебаунс
        if (now - lastBalanceUpdate < BALANCE_UPDATE_COOLDOWN) {
            console.log('Balance update skipped - cooldown active');
            return;
        }
        
        try {
            setIsLoadingBalance(true);
            setLastBalanceUpdate(now);
            const balanceData = await usersAPI.getUserBalance();
            setUserBalance(Number(balanceData.balance) || 0);
        } catch (error) {
            console.error('Error updating user balance:', error);
        } finally {
            setIsLoadingBalance(false);
        }
    }, [isAuthenticated, currentUser, isLoadingBalance, lastBalanceUpdate]);

    // Получаем баланс пользователя при загрузке компонента (только один раз)
    useEffect(() => {
        const fetchUserBalance = async () => {
            // Загружаем баланс только если его еще нет и пользователь авторизован
            if (isAuthenticated && currentUser && !hasInitialBalance && !isLoadingBalance) {
                try {
                    setIsLoadingBalance(true);
                    const balanceData = await usersAPI.getUserBalance();
                    setUserBalance(Number(balanceData.balance) || 0);
                    setHasInitialBalance(true);
                } catch (error) {
                    console.error('Error fetching user balance:', error);
                    setUserBalance(0);
                    setHasInitialBalance(true); // Даже при ошибке помечаем как загруженный
                } finally {
                    setIsLoadingBalance(false);
                }
            }
        };

        fetchUserBalance();
    }, [isAuthenticated, currentUser?.id, hasInitialBalance, isLoadingBalance]);


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
    }, []); 

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
          size: IMAGE_SIZES.USER_MENU_AVATAR, // Для UserMenu використовуємо великий розмір
          fallbackLarge: FALLBACK_IMAGES.LARGE, // ghost_full.png для великого розміру
          fallbackSmall: FALLBACK_IMAGES.SMALL // ghost.png для маленького розміру
        },
      ]
    };
  
    // Слушаем глобальные события для обновления баланса
    useEffect(() => {
        const handleBalanceUpdate = () => {
            // Проверяем, не загружается ли уже баланс
            if (!isLoadingBalance) {
                updateBalance();
            }
        };

        // Слушаем кастомное событие для обновления баланса
        window.addEventListener('updateUserBalance', handleBalanceUpdate);
        
        // Создаем глобальную функцию для обновления баланса
        window.updateUserBalance = updateBalance;
        
        return () => {
            window.removeEventListener('updateUserBalance', handleBalanceUpdate);
            delete window.updateUserBalance;
        };
    }, [updateBalance]); // Только updateBalance в зависимостях

    const handleLogout = async () => {
        try {
            dispatch(logout());
            
            localStorage.removeItem('token');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user');
            
            // Сбрасываем баланс при выходе
            setUserBalance(0);
            
            toast.success('Ви успішно вийшли з системи');
            navigate('/');
        } catch (error) {
            toast.error('Помилка при виході з системи');
            console.error('Logout error:', error);
        }
    };

    const menuItems = [
        { text: 'Власні переклади', href: '/User-translations', icon: '📚' },
        { text: 'Створити переклад', href: '/create-translation', icon: '✏️' },
        { text: 'Закладки', href: '/bookmarks', icon: '🔖' },
        { text: 'ChatVerse', href: '/chat', icon: '🔖' },
        { text: 'Повідомлення', href: '/notification', icon: '🔖' },
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
                        onClick={(e) => { e.stopPropagation(); navigate(goTo); }}
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
                    onClick={handleMenuClick}
                    style={{ cursor: 'pointer', display: 'contents' }}
                >
                    <ProfileImage {...image} />
                </div>
            );
        })}
        <div 
            className="user-profile__clickable-area"
            onClick={handleMenuClick}
            style={{ cursor: 'pointer' }}
        >
            <div>
                {currentUser && currentUser?.username && (
                    <span className="user-profile__name">{currentUser.username}</span>
                )}
                <div className="user-profile__balance">
                    FanCoins: <span>{isLoadingBalance ? 'Завантаження...' : Number(userBalance).toFixed(2)}</span>
                </div>
            </div>
        </div>
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
                        onClick={() => {
                          item.onClick();
                          setIsMenuOpen(false);
                        }}
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