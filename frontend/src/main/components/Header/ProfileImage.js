import React from "react";

export const ProfileImage = ({ src, className, divClassName, alt, style }) => {
  return (
      // <div className={`${divClassName}`}>
        <img
          loading="lazy"
          src={src}
          alt={alt}
          style={style}
          className={`object-contain shrink-0 self-stretch my-auto ${className}`}
        />
      // </div>
  );
};