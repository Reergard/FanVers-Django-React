import { useState } from "react";
import styles from "./Burger.module.css"
import { UserMenu } from "../Header/UserMenu";
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../auth/authSlice';
import { toast } from 'react-toastify';



export default function BurgerMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
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
            { text: 'Повідомлення', href: '/notification ', icon: '🔖' },
            { text: 'Профіль', href: '/profile', icon: '👤' },
            { text: 'Вийти', href: '/logout', icon: '🚪', onClick: handleLogout },
        ];
    return (
        <div className={`${styles.burger_menu} relative ${isOpen && 'active'}`} >
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={isOpen && {position: "fixed", top: "30px", right: "0", zIndex: '10001'} || {}}
                className={`${styles.burger_menu_button} flex flex-col items-center justify-center w-10 h-10 space-y-2 p-2 rounded-md`}
            >
                <span
                    className={`block h-1 h-10 bg-white transition-transform duration-300 ${
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
                    {/*<img className="burger_background" src="../../assets/burger_img_background.svg" alt="Burger Background"></img>*/}
                    <img src="http://localhost:8000/media/users/profile_images/6d160430-b470-4cc1-b10b-62704e42d119.jpg" alt=""></img>
                    <div className={styles.create_book__block} >
                        <div className={styles.create_book}>Створити книгу</div>
                        <ul className={styles.ul_burger_menu}>
                            {/* <li className="py-2 border-b border-gray-700">Сповіщення</li>
                            <li className="py-2 border-b border-gray-700">ChatVerse</li>
                            <li className="py-2">Закладки</li>
                            <li className="py-2">Власні переклади</li>
                            <li className="py-2">Профіль</li>

                            <li className="py-2">Вихід</li> */}
                            {menuItems.map((item, index) => (
                                <li key={index} className="py-2" >
                                    <a href={item.href}>
                                        <span>{item.icon}</span>
                                        {item.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>


    );
}
