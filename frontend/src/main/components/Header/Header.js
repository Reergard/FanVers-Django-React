import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Header.css';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import logoImage from '../../../assets/images/logo/logo.jpg';
import searchIcon from '../../../assets/images/icons/Search_light.svg';
import hoverFrame from '../../../assets/images/icons/frame.svg';
import { useAuth } from '../../../users/auth/useAuth';
import { useSelector } from 'react-redux';

const Header = () => {
  const navigate = useNavigate();
  const { username, isAuthenticated } = useAuth();
  const user = useSelector(state => state.auth.user);
  const authState = useSelector(state => state.auth);

  const socialIcons = [
    {
      src: require('../../../assets/images/icons/profile-icon.png'),
      alt: "Profile"
    }
  ];

  const navigationLinks = [
    { text: "Каталог", to: "/catalog" },
    { text: "Перекладачі", to: "/translators" },
    { text: "Покинуті переклади", to: "/abandoned" },
    { text: "Пошук", to: "/search" }
  ];

  // Состояние для ховера
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
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />
        
        <UserMenu 
          name={username}
          isAuthenticated={isAuthenticated}
          socialIcons={socialIcons}
          unreadNotifications={0}
        />
      </div>
      
      <nav className="navigation">
        <div className="navigation__container">
          {navigationLinks.map((link, index) => (
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
                    src={hoverFrame}
                    alt=""
                    className="navigation-link__frame"
                  />
                )}
                <span className="navigation-link__text">{link.text}</span>
              </Link>
            </div>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;