import { useState } from "react";
import styles from "./Burger.module.css"
import { ProfileImage } from "../Header/ProfileImage";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../auth/authSlice';
import { toast } from 'react-toastify';
import { FALLBACK_IMAGES } from '../../../constants/fallbackImages';

export default function BurgerMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
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
        { text: 'Власні переклади', href: '/User-translations', icon: '📚' },
        { text: 'Створити переклад', href: '/create-translation', icon: '✏️' },
        { text: 'Закладки', href: '/bookmarks', icon: '🔖' },
        { text: 'ChatVerse', href: '/chat', icon: '🔖' },
        { text: 'Повідомлення', href: '/notification', icon: '🔖' },
        { text: 'Профіль', href: '/profile', icon: '👤' },
        { text: 'Вийти', icon: '🚪', onClick: handleLogout },
    ];
    
    return (
        <div className={`${styles.burger_menu} relative ${isOpen ? styles.active : ''}`} >
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={isOpen ? { position: 'fixed', top: '30px', right: 0, zIndex: 10001 } : undefined}
                className={`${styles.burger_menu_button} flex flex-col items-center justify-center w-10 h-10 space-y-2 p-2 rounded-md`}
            >
                <span
                    className={`block h-1 w-8 bg-white transition-transform duration-300 ${
                        isOpen ? "rotate-45 translate-y-2" : ""
                    }`}
                ></span>
                <span
                    className={`block h-1 w-8 bg-white transition-opacity duration-300 ${
                        isOpen ? "opacity-0" : ""
                    }`}
                ></span>
                <span
                    className={`block h-1 w-8 bg-white transition-transform duration-300 ${
                        isOpen ? "-rotate-45 -translate-y-3" : ""
                    }`}
                ></span>
            </button>
            {isOpen && (
                <div className={`${styles.burger_menu__content} fixed top-0 right-0 bg-gray-800 text-white p-4 rounded-md shadow-lg`}>
                    <ProfileImage
                        src={currentUser?.profile_image_large || currentUser?.image}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                        size="large"
                        fallbackLarge={FALLBACK_IMAGES.LARGE}
                        fallbackSmall={FALLBACK_IMAGES.SMALL}
                    />
                    <div className={styles.create_book__block} >
                        <div className={styles.create_book}>Створити книгу</div>
                        <ul className={styles.ul_burger_menu}>
                            {menuItems.map((item, index) => (
                                <li key={index} className="py-2" >
                                    {item.onClick ? (
                                        <button 
                                            onClick={() => { 
                                                item.onClick(); 
                                                setIsOpen(false); 
                                            }}
                                            className="text-left w-full"
                                        >
                                            <span>{item.icon}</span>
                                            {item.text}
                                        </button>
                                    ) : (
                                        <Link 
                                            to={item.href} 
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <span>{item.icon}</span>
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
}
