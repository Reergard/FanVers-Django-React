import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-column">
                    <h3>Для правовласників</h3>
                    <ul>
                        <li><Link to="/user-agreement">Угода користувача</Link></li>
                        <li><Link to="/privacy-policy">Політика компанії щодо обробки персональних даних</Link></li>
                        <li><Link to="/content-rules">Правила розміщення авторського контенту</Link></li>
                        <li><Link to="/confidentiality">Угода конфіденційності</Link></li>
                        <li><Link to="/author-agreement">Публічний договір з автором</Link></li>
                    </ul>
                </div>
                
                <div className="footer-column">
                    <h3>Довідка</h3>
                    <ul>
                        <li><Link to="/translator-agreement">Договір між автором та перекладачем</Link></li>
                        <li><Link to="/say-thanks">Сказати «дякую!»</Link></li>
                        <li><Link to="/contacts">Контакти</Link></li>
                        <li><Link to="/balance-help">Не поповнився баланс?</Link></li>
                        <li><Link to="/support">Написати у підтримку</Link></li>
                        <li><Link to="/payment">Оплата</Link></li>
                    </ul>
                </div>
                
                <div className="footer-column">
                    <h3>Ми у соц.мережах</h3>
                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <FaFacebook className="social-icon" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <FaInstagram className="social-icon" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;