import React from "react";
import styles from "./AllSettings.module.css";
import CheckSave from "../../../main/pages/img/CheckSave.png";

function Subscription() {
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