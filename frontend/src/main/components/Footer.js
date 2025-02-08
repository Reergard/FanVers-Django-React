import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import '../styles/Footer.css';
import {FaFacebook, FaInstagram, FaYoutube} from 'react-icons/fa';
import {SearchBar} from "./Header/SearchBar";
import facebook from "../../assets/images/icons/facebook.png";
import youtube from "../../assets/images/icons/youtube.png";
import instagram from "../../assets/images/icons/instagram.png";
import searchIcon from "../../assets/images/icons/Search_light.svg";
import logoImage from "../../assets/images/logo/logo2.0_250.png";
import brook from "../../main/assets/brook.png";
import vectorHorizontal from "../../main/assets/VectorHorizontal.png";
import {UserMenu} from "./Header/UserMenu";

const Footer = () => {
    const navigate = useNavigate();

    return (
        /*<div className="headerContent">
            <div className="searchContainer">
                <SearchBar
                    label="Пошук по сайту"
                    iconSrc={searchIcon}
                />
            </div>

            <img
                src={logoImage}
                alt="Logo"
                className="logo"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
            />

            <UserMenu
                name={username}
                isAuthenticated={isAuthenticated}
                socialIcons={socialIcons}
                unreadNotifications={0}
            />
        </div>*/

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

                <img src={brook} alt="brook" className="brook"/>

                <img
                    src={logoImage}
                    alt="Logo"
                    className="footer_logo"
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer' }}
                />

                <img src={brook} alt="brook" className="brook"/>
                
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

                <img src={brook} alt="brook" className="brook"/>
                
                <div className="footer-column"
                     style={{ maxWidth: '170px', textAlign: 'center', margin: '0 auto'}}>
                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <img src={facebook} alt="facebook"/>
                            {/*<FaFacebook className="social-icon" />*/}
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                            <img src={youtube} alt="youtube"/>
                            {/*<FaYoutube className="social-icon" />*/}
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <img src={instagram} alt="instagram"/>
                            {/*<FaInstagram className="social-icon" />*/}
                        </a>
                    </div>
                    <h3>Увага! Сайт може містити матеріали, не призначені для перегляду особами, які не досягли 18 років!</h3>
                </div>
            </div>
            <img
                src={vectorHorizontal}
                alt="Vector"
            />
            <div className="footer__inner text-center" style={{paddingTop: '30px', fontSize: '20px', paddingBottom: '3px', fontFamily: 'Inter', color: '#5E626C'}}>
                <span style={{marginRight: '50px'}}>FanVerse © 2023</span><span>All rights reserved</span>
            </div>
        </footer>
    );
};

export default Footer;