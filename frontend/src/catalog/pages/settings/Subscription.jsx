import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import styles from "../../css/AllSettings.module.css";
import CheckSave from '../../../main/pages/img/CheckSave.png';
import { catalogAPI } from '../../../api/catalog/catalogAPI';
import { useToast } from "../../../components/CustomToast";

function Subscription() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { error: showError } = useToast();
    const userInfo = useSelector(state => state.auth.userInfo);

    // Завантажуємо дані книги для перевірки власника
    const { data: book } = useQuery({
        queryKey: ['book', slug],
        queryFn: () => catalogAPI.fetchBook(slug),
        enabled: !!slug,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 5 * 60 * 1000, // 5 минут
    });

    // Перевіряємо права доступу
    useEffect(() => {
        if (book && userInfo) {
            const isOwner = book.owner === userInfo.id;
            if (!isOwner) {
                showError('У вас немає прав для перегляду налаштувань абонементу цієї книги');
                navigate(`/books/${slug}`);
            }
        }
    }, [book, userInfo, slug, navigate, showError]);

    // Показуємо завантаження, якщо перевіряємо права
    if (book && userInfo) {
        const isOwner = book.owner === userInfo.id;
        if (!isOwner) {
            return <div>Перевірка прав доступу...</div>;
        }
    }

    return (
        <>
        <div className={styles.subscriptionContainer}>
            <table className={styles.subscription}>
                <tbody>
                    <tr>
                        <td>Вартість  за 1 розділ</td>
                        <td><div className={styles.big_input}><input type="number" /></div></td>
                        <td>UAcoins</td>
                    </tr>
                    <tr>
                        <td>Знижка % (при покупці від 10 розділів)</td>
                        <td><div className={styles.big_input}><input type="number" /></div></td>
                        <td>UAcoins</td>
                    </tr>
                    <tr>
                        <td>Абонемент 1</td>
                        <td className={styles.container_input}><input className={styles.sub_input} type="number" />
                            <span>Розділів</span><input className={styles.sub_input} type="number" /><span>UAcoins</span></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Абонемент 1</td>
                        <td className={styles.container_input}><input className={styles.sub_input} type="number" />
                            <span>Розділів</span><input className={styles.sub_input} type="number" /><span>UAcoins</span></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
          
        </div>
          <div className={styles.AccessRightsSave}>
          <button>
              <img src={CheckSave} />
              <span>Зберегти</span>
          </button>
      </div>
     </>
    )
}

export default Subscription;
