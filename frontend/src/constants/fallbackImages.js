// Константи для fallback зображень профілю
// Використовуємо імпорти з src/assets замість шляхів з public
import ghost from '../assets/images/icons/ghost.png';
import ghost_full from '../assets/images/icons/ghost_full.png';

export const FALLBACK_IMAGES = {
  // Маленькі зображення (для хедера, списків, тощо)
  SMALL: ghost,
  
  // Великі зображення (для профілю, модальних вікон, тощо)
  LARGE: ghost_full,
  
  // За замовчуванням
  DEFAULT: ghost
};

// Розміри зображень для різних контекстів
export const IMAGE_SIZES = {
  HEADER_AVATAR: 'small',
  USER_MENU_AVATAR: 'large',
  PROFILE_PAGE: 'large',
  USER_LIST: 'small',
  COMMENT_AVATAR: 'small',
  NOTIFICATION_AVATAR: 'small'
};

// CSS класи для різних розмірів
export const IMAGE_CLASSES = {
  SMALL: 'profile-image--small',
  LARGE: 'profile-image--large',
  DEFAULT: 'profile-image--default'
};
