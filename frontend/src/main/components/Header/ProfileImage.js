import React from "react";

export const ProfileImage = ({ src, className, alt }) => {
  return (
    <img
      loading="lazy"
      src={src}
      alt={alt}
      className={`object-contain shrink-0 self-stretch my-auto ${className}`}
    />
  );
};