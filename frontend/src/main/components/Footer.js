import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Footer.css";
import facebook from "../../assets/images/icons/facebook.png";
import youtube from "../../assets/images/icons/youtube.png";
import instagram from "../../assets/images/icons/instagram.png";
import logoImage from "../../assets/images/logo/logo2.0_250.png";
import brook from "../../main/assets/brook.png";
import vectorHorizontal from "../../main/assets/VectorHorizontal.png";
import BgLaptop from "../../catalog/pages/img/dragons.svg";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="container-laptop">
        {" "}
        <img src={BgLaptop} className="laptop-bg" />
      </div>

      <div className="footer-content">
        <div className="footer-column left-footer">
          <h3>Для правовласників</h3>
          <ul>
            <li>
              <Link to="/user-agreement">Угода користувача</Link>
            </li>
            <li>
              <Link to="/privacy-policy">
                Політика компанії щодо обробки персональних даних
              </Link>
            </li>
            <li>
              <Link to="/content-rules">
                Правила розміщення авторського контенту
              </Link>
            </li>
            <li>
              <div className="line-footer"></div>
            </li>
            <li>
              <Link to="/confidentiality">Угода конфіденційності</Link>
            </li>
            <li>
              <Link to="/author-agreement">Публічний договір з автором</Link>
            </li>
          </ul>
        </div>

        <img src={brook} alt="brook" className="brook" />

        <img
          src={logoImage}
          alt="Logo"
          className="footer_logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />

        <img src={brook} alt="brook" className="brook" />

        <div className="footer-column right">
          <h3>Довідка</h3>
          <ul>
            <li>
              <Link to="/translator-agreement">
                Договір між автором та перекладачем
              </Link>
            </li>
            <li>
              <Link to="/say-thanks">Сказати «Дякую!»</Link>
            </li>
            <li>
              <Link to="/contacts">Контакти</Link>
            </li>
            <li>
              <Link to="/balance-help">Не поповнився баланс?</Link>
            </li>
            <li style={{width: "100%"}}>
              <div className="line-footer"></div>
            </li>
            <li>
              <Link to="/support">Написати у підтримку</Link>
            </li>
            <li>
              <Link to="/payment">Оплата</Link>
            </li>
          </ul>
        </div>

        <img src={brook} alt="brook" className="brook" />

        <div className="footer-column bottom">
          <div className="social-links">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={facebook} alt="facebook" />
            </a>
            <a
              className="youtube-logo"
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={youtube} alt="youtube" />
            </a>
            <img
              src={logoImage}
              alt="Logo"
              className="last-logo"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            />
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={instagram} alt="instagram" />
            </a>
          </div>
          <h3>
            Увага! Сайт може містити матеріали, не призначені для перегляду
            особами, які не досягли 18 років!
          </h3>
        </div>
      </div>
      <img style={{ margin: "0 auto" }} src={vectorHorizontal} alt="Vector" />
      <div
        className="footer__inner text-center"
        style={{
          paddingTop: "30px",
          fontSize: "20px",
          paddingBottom: "3px",
          fontFamily: "Inter",
          color: "#5E626C",
        }}
      >
        <span style={{ marginRight: "50px" }}>FanVerse © 2023</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
};

export default Footer;
