import React from 'react';
import { NavigationLink } from './NavigationLink';

export const Navigation = ({ links }) => (
  <nav className="navigation">
    <div className="navigation__container">
      {links.map((link, index) => (
        <NavigationLink 
          key={index}
          text={link.text}
          imageSrc={link.imageSrc}
          href={link.href}
        />
      ))}
    </div>
  </nav>
);