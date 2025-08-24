import React, { Fragment, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Header.css";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";
import logoImage from "../../../assets/images/logo/logo2.0.png";
import searchIcon from "../../../assets/images/icons/Search_light.svg";
import hoverFrame from "../../../assets/images/icons/frame.svg";
import { useAuth } from "../../../auth/hooks/useAuth";
import StarHeader from "../../images/star-header.svg";
import BgHomepage from "../../images/bg-homepage.svg";
import BurgerMenu from "../Burger/Burger";

const Header = () => {
  const navigate = useNavigate();
  const { username, isAuthenticated } = useAuth();
  const burgerRef = useRef(null);
  
  const openUnifiedMenu = () => burgerRef.current?.open();

  const isHomePage = window.location.pathname === "/";
  const navigationLinks = [
    { text: "Каталог", to: "/catalog" },
    { text: "Чарівний Гід", to: "/magical-guide" },
    { text: "Автори", to: "/authors" },
    { text: "Перекладачі", to: "/translators" },
    { text: "Покинуті переклади", to: "/abandoned-translations" },
    { text: "Пошук", to: "/search" },
    { text: "FAQ", to: "/faq" },
  ];

  // Стан для ховера
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <header className="header">
      <div className="headerContent">
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
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />

        <UserMenu
          name={username}
          isAuthenticated={isAuthenticated}
          unreadNotifications={0}
          onOpenMenu={openUnifiedMenu}
        />
      </div>
      {isHomePage && <img className="extra-div" src={BgHomepage} />}
      {/* Бургер вне флекс-контейнера, чтобы не сдвигать элементы на десктопе */}
      <BurgerMenu ref={burgerRef} />
      <nav className="navigation">
        <div className="navigation__container">
          {navigationLinks.map((link, index) => (
            <Fragment key={index}>
              <div className="navigation-link-wrapper">
                <Link
                  to={link.to}
                  className="navigation-link"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {hoveredIndex === index && (
                    <img
                      loading="lazy"
                      src={hoverFrame}
                      alt=""
                      className="navigation-link__frame"
                    />
                  )}
                  <span className="navigation-link__text">{link.text}</span>
                </Link>
              </div>
              <div className="stars-header">
                <img src={StarHeader} />
              </div>
            </Fragment>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
