import React from 'react';
import styles from './NotificationModal.module.css';

import CornerTL from '../images/NotificationModalElement1.svg';
import CornerTR from '../images/NotificationModalElement2.svg';
import CornerBL from '../images/NotificationModalElement3.svg';
import CornerBR from '../images/NotificationModalElement4.svg';
import UpOrn   from '../images/NotificationModalElementUp.svg';
import DnOrn   from '../images/NotificationModalElementDn.svg';
// import Line2   from '../images/NotificationModalElementLine2.svg'; // Убираем импорт SVG

export default function NotificationModal({ isOpen, onClose, message, type = 'info' }) {
  if (!isOpen) return null;
  return (
      <div className={styles.modalContainer} role="dialog" aria-modal="true">
        {/* ФОН */}
        <div className={styles.modalBackground} />

        {/* СЛОЙ РАМКИ */}
        <div className={styles.frameLayer} aria-hidden>
          {/* УГЛЫ */}
          <img src={CornerTL} alt="" className={`${styles.corner} ${styles.tl}`} />
          <img src={CornerTR} alt="" className={`${styles.corner} ${styles.tr}`} />
          <img src={CornerBL} alt="" className={`${styles.corner} ${styles.bl}`} />
          <img src={CornerBR} alt="" className={`${styles.corner} ${styles.br}`} />

          {/* ВЕРХ/НИЗ ОРНАМЕНТ — строго по центру X */}
          <img src={UpOrn} alt="" className={`${styles.cap} ${styles.capTop}`} />
          <img src={DnOrn} alt="" className={`${styles.cap} ${styles.capBottom}`} />

          {/* Растягиваемые соединения */}
          {/* Верхняя полоса: Line2 + тонкая 1px линия по центру */}
          <div className={`${styles.hBand} ${styles.topBand}`}>
            <div className={styles.hBandLine}></div>
            <span className={styles.hHairline} />
          </div>

          {/* Нижняя полоса */}
          <div className={`${styles.hBand} ${styles.bottomBand}`}>
            <div className={styles.hBandLine}></div>
            <span className={styles.hHairline} />
          </div>

          {/* Вертикальные 1px линии (левая/правая) */}
          <span className={`${styles.vHairline} ${styles.leftLine}`} />
          <span className={`${styles.vHairline} ${styles.rightLine}`} />
        </div>

        {/* КОНТЕНТ */}
        <div className={styles.messageContainer}>
          <p className={styles.messageText}>{message}</p>
        </div>

        {/* Кнопка закрытия */}
        <button className={styles.closeButton} onClick={onClose} aria-label="Закрити">×</button>
      </div>
  );
}
