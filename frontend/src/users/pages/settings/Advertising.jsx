import React from "react";
import styles from "./AllSettings.module.css";
import { Form } from "react-bootstrap";
import buttonAdvertisingImg from "./img/Check_ring_light.svg";

function Advertising() {
    return (
        <div className={styles.AdvertisingContainer}>

            <table className={styles.AdvertisingTable}>
                <tbody>
                    <tr>
                        {/* <td className={styles.centerAlign}></td> */}
                        <td className={styles.centerAlign}>
                            <Form.Check
                                type="checkbox"
                                id="hide-adult-content"
                                className={`adult-content-checkbox ${styles.AdvertisingCheck}`}
                            />
                            <div className={styles.nameAdvertising}>
                                <span>Реклама на головній (30 FanCoins/день)</span>
                                <p>в каруселі «Реклама» на головній сторінці, максимум 1 книга на день</p>
                            </div>
                        </td>
                        <td >
                            <div className={styles.dateAdvertising}>
                                <input type="date" name="trip-start" value="2018-07-22" />
                                <input type="date" name="trip-start" value="2018-07-22" />
                            </div>
                        </td>
                        <td>
                            <div className={styles.sumAdvertising}>
                                <div className={styles.inputBlockAdvertising}>
                                    <label for="tentacles">Вартість:</label>

                                    <input type="number" id="tentacles" name="tentacles" />
                                </div>
                                <span>FanCoins</span>
                            </div>
                        </td>
                        <td>
                            <button className={styles.buttonAdvertising}>
                                <img src={buttonAdvertisingImg} />
                                Замовити
                            </button>
                        </td>
                    </tr>
                    <tr>
                        {/* <td className={styles.centerAlign}> </td> */}
                        <td className={styles.centerAlign}>
                            <Form.Check
                                type="checkbox"
                                id="hide-adult-content"
                                className={`adult-content-checkbox ${styles.AdvertisingCheck}`}
                            />
                            <div className={styles.nameAdvertising}>
                                <span>Реклама на сторінці Каталог
                                    (15 FanCoins/день)</span>
                                <p>в каруселі «Реклама» на головній сторінці, максимум 1 книга на день</p>
                            </div>
                        </td>
                        <td >
                            <div className={styles.dateAdvertising}>
                                <input type="date" name="trip-start" value="2018-07-22" />
                                <input type="date" name="trip-start" value="2018-07-22" />
                            </div>
                        </td>
                        <td>
                            <div className={styles.sumAdvertising}>
                                <div className={styles.inputBlockAdvertising}>
                                    <label for="tentacles">Вартість:</label>

                                    <input type="number" id="tentacles" name="tentacles" />
                                </div>
                                <span>FanCoins</span>
                            </div>
                        </td>
                        <td>
                            <button className={styles.buttonAdvertising}>
                                <img src={buttonAdvertisingImg} />
                                Замовити
                            </button>
                        </td>
                    </tr>
                    <tr className={styles.tableRow}>
                        {/* <td className={styles.centerAlign}>
                         
                        </td> */}
                        <td className={styles.centerAlign}>
                            <Form.Check
                                type="checkbox"
                                id="hide-adult-content"
                                className={`adult-content-checkbox ${styles.AdvertisingCheck}`}
                            />
                            <div className={styles.nameAdvertising}>
                                <span>Реклама у пошуку за жанрами (15 FanCoins/день)</span>
                                <p>в каруселі «Реклама» на головній сторінці, максимум 1 книга на день</p>
                            </div>
                        </td>
                        <td >
                            <div className={styles.calendar_block}>
                                <div className={styles.dateAdvertising}>
                                    <input type="date" name="trip-start" value="2018-07-22" />
                                    <input type="date" name="trip-start" value="2018-07-22" />
                                </div>
                                <div className={styles.select_block}>
                                    <span>Оберіть жанр</span>
                                    <div className={styles.customSelectWrapper}>
                                        <select name="select" className={styles.customSelect}>
                                            <option value="value1">Жанр 1</option>
                                            <option value="value2">Жанр 2</option>
                                            <option value="value3">Жанр 3</option>
                                        </select>
                                        <div className={styles.customArrow}></div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className={styles.sumAdvertising}>
                                <div className={styles.inputBlockAdvertising}>
                                    <label htmlFor="tentacles">Вартість:</label>
                                    <input type="number" id="tentacles" name="tentacles" />
                                </div>
                                <span>FanCoins</span>
                            </div>
                        </td>
                        <td>
                            <button className={styles.buttonAdvertising}>
                                <img src={buttonAdvertisingImg} />
                                Замовити
                            </button>
                        </td>
                    </tr>
                    <tr className={styles.tableRow}>
                        {/* <td className={styles.centerAlign}>
                           
                        </td> */}
                        <td className={styles.centerAlign}>
                            <Form.Check
                                type="checkbox"
                                id="hide-adult-content"
                                className={`adult-content-checkbox ${styles.AdvertisingCheck}`}
                            />
                            <div className={styles.nameAdvertising}>
                                <span>Реклама у пошуку за тегами (15 FanCoins/день)</span>
                                <p>в каруселі «Реклама» на головній сторінці, максимум 1 книга на день</p>
                            </div>
                        </td>
                        <td >
                            <div className={styles.calendar_block}>
                                <div className={styles.dateAdvertising}>
                                    <input type="date" name="trip-start" value="2018-07-22" />
                                    <input type="date" name="trip-start" value="2018-07-22" />
                                </div>
                                <div className={styles.select_block}>
                                    <span>Оберіть теги</span>
                                    <div className={styles.customSelectWrapper}>
                                        <select name="select" className={styles.customSelect}>
                                            <option value="value1">Тег 1</option>
                                            <option value="value2">Тег 2</option>
                                            <option value="value3">Тег 3</option>
                                        </select>
                                        <div className={styles.customArrow}></div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className={styles.sumAdvertising}>
                                <div className={styles.inputBlockAdvertising}>
                                    <label htmlFor="tentacles">Вартість:</label>
                                    <input type="number" id="tentacles" name="tentacles" />
                                </div>
                                <span>FanCoins</span>
                            </div>
                        </td>
                        <td>
                            <button className={styles.buttonAdvertising}>
                                <img src={buttonAdvertisingImg} />
                                Замовити
                            </button>
                        </td>
                    </tr>
                    <tr className={styles.tableRow}>
                        {/* <td className={styles.centerAlign}>
                           
                        </td> */}
                        <td className={styles.centerAlign}>
                            <Form.Check
                                type="checkbox"
                                id="hide-adult-content"
                                className={`adult-content-checkbox ${styles.AdvertisingCheck}`}
                            />
                            <div className={styles.nameAdvertising}>
                                <span>Реклама у пошуку за фендом (15 FanCoins/день)</span>
                                <p>в каруселі «Реклама» на головній сторінці, максимум 1 книга на день</p>
                            </div>
                        </td>
                        <td >
                            <div className={styles.calendar_block}>
                                <div className={styles.dateAdvertising}>
                                    <input type="date" name="trip-start" value="2018-07-22" />
                                    <input type="date" name="trip-start" value="2018-07-22" />
                                </div>
                                <div className={styles.select_block}>
                                    <span>Оберіть фендом</span>
                                    <div className={styles.customSelectWrapper}>
                                        <select name="select" className={styles.customSelect}>
                                            <option value="value1">Фендом 1</option>
                                            <option value="value2">Фендом 2</option>
                                            <option value="value3">Фендом 3</option>
                                        </select>
                                        <div className={styles.customArrow}></div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className={styles.sumAdvertising}>
                                <div className={styles.inputBlockAdvertising}>
                                    <label htmlFor="tentacles">Вартість:</label>
                                    <input type="number" id="tentacles" name="tentacles" />
                                </div>
                                <span>FanCoins</span>
                            </div>
                        </td>
                        <td>
                            <button className={styles.buttonAdvertising}>
                                <img src={buttonAdvertisingImg} />
                                Замовити
                            </button>
                        </td>
                    </tr>
                    <tr className={`${styles.tableRow} ${styles.paddingRow}`}>
                        {/* <td className={styles.centerAlign}>
                           
                        </td> */}
                        <td className={styles.centerAlign}>
                            <div className={styles.total}>
                                <p>Загальна вартість: 1950 FanCoins</p>
                                <p>Ваш баланс: 5950 FanCoins</p>
                            </div>
                        </td>

                        <td style={{ marginRight: "30px" }}>
                            <button className={styles.buttonAdvertising}>
                                <img src={buttonAdvertisingImg} />
                                Опублікувати
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default Advertising;