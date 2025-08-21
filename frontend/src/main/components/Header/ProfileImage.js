import React, { useState, useEffect } from "react";
import { FALLBACK_IMAGES } from "../../../constants/fallbackImages";

export const ProfileImage = ({ 
  src, 
  className = '', 
  alt, 
  style, 
  size = 'default',
  fallbackSmall = FALLBACK_IMAGES.SMALL,
  fallbackLarge = FALLBACK_IMAGES.LARGE
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  
  // Оновлюємо imageSrc при зміні src
  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
  }, [src]);
  
  const getFallbackImage = () => {
    if (size === 'large') return fallbackLarge;
    return fallbackSmall;
  };
  
  const handleImageError = () => {
    console.log(`ProfileImage: Ошибка загрузки изображения ${imageSrc}, используем fallback`);
    if (!hasError) {
      const fallbackSrc = getFallbackImage();
      console.log(`ProfileImage: Fallback изображение: ${fallbackSrc}`);
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
  };
  
  // Якщо src пустий, одразу використовуємо fallback
  const finalSrc = src || getFallbackImage();
  
  // Базові розміри для стабільної верстки (CLS), якщо не задано через style
  const baseWidth = style?.width ? undefined : 160;
  const baseHeight = style?.height ? undefined : 160;
  
  return (
    <img
      loading="lazy"
      decoding="async"
      draggable={false}
      referrerPolicy="no-referrer"
      src={imageSrc || finalSrc}
      alt={alt || 'Фото профілю'}
      width={baseWidth}
      height={baseHeight}
      style={style}
      className={`object-contain shrink-0 self-stretch my-auto ${className}`}
      onError={handleImageError}
    />
  );
};