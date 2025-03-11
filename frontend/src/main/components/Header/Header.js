import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Header.css";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";
import logoImage from "../../../assets/images/logo/logo2.0.png";
import searchIcon from "../../../assets/images/icons/Search_light.svg";
import hoverFrame from "../../../assets/images/icons/frame.svg";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useSelector } from "react-redux";
import { Navigation } from "./Navigation";
import { BreadCrumb } from "../BreadCrumb";
import StarHeader from "../../images/star-header.svg";
import HoverMenu from "../../images/hoverMenu.svg";
import BgHomepage from "../../images/bg-homepage.svg";
import BurgerMenu from "../Burger/Burger";

const Header = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const navigate = useNavigate();
  const { username, isAuthenticated } = useAuth();
  const user = useSelector((state) => state.auth.user);
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const socialIcons = [
    {
      src: require("../../../assets/images/icons/profile-icon.png"),
      alt: "Profile",
    },
  ];
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
        {/* <div className="burger_menu">
          {" "}
          <div className="burger"></div>
          <div className="burger"></div>
          <div className="burger"></div>
        </div> */}
        <BurgerMenu />

       
        <div className="searchContainer">
          <SearchBar
            // label="Пошук по сайту"
            label={!isMobile ? "Пошук по сайту" : "..."}
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
          socialIcons={socialIcons}
          unreadNotifications={0}
        />
      </div>
      {isHomePage && <img className="extra-div" src={BgHomepage} />}
      <nav className="navigation">
        <div className="navigation__container">
          {navigationLinks.map((link, index) => (
            <>
              <div key={index} className="navigation-link-wrapper">
                <Link
                  to={link.to}
                  className="navigation-link"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {hoveredIndex === index && (
                    <img
                      loading="lazy"
                      src={window.innerWidth < 1024 ? HoverMenu : hoverFrame}
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
            </>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
