import React, { useState } from "react";
import styles from "./AllSettings.module.css";
import { Form } from "react-bootstrap";
import CheckSave from "../../../main/pages/img/CheckSave.png";


function AccessRights() {
    const PERMISSIONS = [
        "Увійти на сторінку книги",
        "Коментувати книгу",
        "Коментувати розділ",
        "Завантажити",
        "Оцінити",
    ];

    const ROLES = ["Усі", "Модератори", "Ніхто"];
    const [permissions, setPermissions] = useState(
        PERMISSIONS.reduce((acc, perm) => {
            acc[perm] = { Усі: false, Модератори: false, Ніхто: false };
            return acc;
        }, {})
    );

    const togglePermission = (perm, role) => {
        setPermissions((prev) => ({
            ...prev,
            [perm]: { ...prev[perm], [role]: !prev[perm][role] },
        }));
    };
    return (
        <>
            <table className={styles.permissionsTable}>
                <thead>
                    <tr>
                        <th>Що можуть робити</th>
                        {ROLES.map((role) => (
                            <th key={role}>{role}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {PERMISSIONS.map((perm) => (
                        <tr key={perm}>
                            <td>{perm}</td>
                            {ROLES.map((role) => (
                                <td key={role}>
                                    <Form.Check
                                        type="checkbox"
                                        checked={permissions[perm][role]}
                                        onChange={() => togglePermission(perm, role)}
                                        id="hide-adult-content"
                                        style={{ justifyContent: "center" }}
                                        // checked={hideAdultContent}
                                        // onChange={handleAdultContentChange}
                                        className="adult-content-checkbox"
                                    />

                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className={styles.AccessRightsSave}>
                <button>
                    <img src={CheckSave} />
                    <span>Зберегти</span>
                </button>
            </div>
        </>
    )
}

export default AccessRights;