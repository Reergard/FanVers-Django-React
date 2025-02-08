import React from "react";

export const ProfileImage = ({ src, className, alt, style }) => {
  return (
        <img
          loading="lazy"
          src={src}
          alt={alt}
          style={style}
          className={`object-contain shrink-0 self-stretch my-auto ${className}`}
        />
  );
};