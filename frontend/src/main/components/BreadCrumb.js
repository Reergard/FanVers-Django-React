import React from 'react';
import styles from "../styles/Breadcrumb.module.css"
import chevron_right from "../../assets/images/icons/chevron_right.svg"


export const BreadCrumb = ({ items }) => (
    <div className={styles.breadcrumb__container}>
        {items.map((item, index) => (
            <span key={index} className={styles.breadcrumb__block}>
                {index > 0 && <img src={chevron_right} className="separator" alt="chevron_right"/>}
                <a href={item.href} style={{color:  index > 0 ? '#05B4C7': '#00EAFD'}}>{item.label}</a>
            </span>
        ))}
        <h2>{items[items.length - 1].label}</h2>
    </div>
);
