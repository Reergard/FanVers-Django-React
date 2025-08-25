import React from "react";
import { BreadCrumb } from '../../main/components/BreadCrumb';
import styles from "../css/Faq.module.css";


const Faq = () => {
    return (
        <>
            <BreadCrumb
                items={[
                    { href: "/", label: "Головна" },
                    { href: "/faq", label: "FAQ" },
                ]}
            />
            <div className={styles.container}>   <h1 className={styles.nameFaq}>
                Як користуватись сайтом
            </h1>
                <div className={styles.blockFaq}>
                    <a href="#">Як створити переклад на сайті UAlate.com</a>
                    <a href="#">Налаштування перекладу</a>
                    <a href="#">Теги / жанри / фендоми</a>
                    <a href="#">Як створити перший розділ у перекладі</a>
                    <a href="#">Реклама вашого перекладу на сайті</a>
                    <a href="#">Як поповнити баланс</a>
                    <a href="#">Як знайти цікаву розповідь</a>
                    <a href="#">Помилки у тексті</a>
                    <a href="#">Коментарі</a>
                </div>
            </div>
        </>
    )
}

export default Faq;