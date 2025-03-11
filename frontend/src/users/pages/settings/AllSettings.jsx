import React, { useState } from "react";
import styles from "./AllSettings.module.css";
import AccessRights from "./AccessRights";
import Advertising from "./Advertising";
import GeneralSettings from "./GeneralSettings";
import Subscription from "./Subscription";
import BgChapter from "./img/bg-chapter.png";
import { BreadCrumb } from "../../../main/components/BreadCrumb";



const TABS = {
    general: { label: "Загальні налаштування", component: <GeneralSettings /> },
    subscription: { label: "Абонемент", component: <Subscription /> },
    advertising: { label: "Реклама на сайті", component: <Advertising /> },
    accessRights: { label: "Права доступу", component: <AccessRights /> },
};

function AllSettings() {
    const [activeTab, setActiveTab] = useState("general");

    return (
        <>
            <BreadCrumb
                items={[
                    { href: "/", label: "Головна" },
                    { href: "/all-settings", label: "Налаштування перекладу" },
                ]}
            />

            <div className={styles.HeaderAllSettings} style={{ paddingBottom: activeTab === "advertising" ? "50px" : "20px", borderBottom: activeTab === "advertising" ? "none" : "#fded01 1px solid", justifyContent: activeTab === "advertising" ? "center" : "flex-start", width: activeTab === "advertising" ? "70%" : "50%", }}>
                {Object.entries(TABS).map(([key, { label }]) => (
                    key === "advertising" && activeTab === "advertising" ? (
                        // Если активна вкладка "Реклама" - заменяем кнопку на кастомный блок
                        <div className={styles.containerBlockNameChapter}> 
                        <div  className={`block-name-chapter ${styles.BlockNameChapter}`}  key={key}>
                            <img src={BgChapter} className={`top-chapter ${styles.TopChapter}`} />
                            <div className={`chapter-name ${styles.settingsHeader}`}>
                                <span>Реклама</span>
                            </div>
                            <img src={BgChapter} className={`bot-chapter ${styles.BotChapter}`} />
                        </div>
                            <p>* Увага, після натискання на кнопку "Опублікувати" вартість реклами автоматично списується з вашого балансу.</p>
                        </div>
                    ) : (
                        // Обычные кнопки
                        <button
                            key={key}
                            className={activeTab === key ? styles.active : ""}
                            onClick={() => setActiveTab(key)}
                        >
                            {label}
                        </button>
                    )
                ))}
            </div>

            <div className={styles.Content}>{TABS[activeTab].component}</div>
        </>
    );
}
export default AllSettings;