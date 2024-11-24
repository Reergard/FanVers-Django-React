import React, { useState } from 'react';

export const NavigationLink = ({ text, imageSrc, href }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="navigation-link-wrapper">
      <a 
        href={href}
        className="navigation-link"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/3c148f82b167d57c661a135cc568af27e0ac82ddd4851f6e8a5d6ab7c3c98e06"
            alt=""
            className="navigation-link__frame"
          />
        )}
        <span className="navigation-link__text">{text}</span>
      </a>
    </div>
  );
};