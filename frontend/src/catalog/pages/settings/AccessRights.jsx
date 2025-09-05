import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import styles from "../../css/AllSettings.module.css";
import { Form } from "react-bootstrap";
import CheckSave from '../../../main/pages/img/CheckSave.png';
import { catalogAPI } from '../../../api/catalog/catalogAPI';
import { useToast } from "../../../components/CustomToast";

function AccessRights() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    const userInfo = useSelector(state => state.auth.userInfo);
    
    const PERMISSIONS = [
        { key: "view_permission", label: "Увійти на сторінку книги" },
        { key: "comment_book_permission", label: "Коментувати книгу" },
        { key: "comment_chapter_permission", label: "Коментувати розділ" },
        { key: "download_permission", label: "Завантажити" },
        { key: "rate_permission", label: "Оцінити" },
    ];

    const ROLES = [
        { key: "all", label: "Усі" },
        { key: "bookmarked", label: "У кого в закладках" },
        { key: "none", label: "Ніхто" }
    ];

    const [permissions, setPermissions] = useState(
        PERMISSIONS.reduce((acc, perm) => {
            acc[perm.key] = "all"; // Значення за замовчуванням
            return acc;
        }, {})
    );

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Завантажуємо поточні налаштування доступу
    const { data: accessRights, isLoading: accessRightsLoading } = useQuery({
        queryKey: ['bookAccessRights', slug],
        queryFn: () => catalogAPI.getBookAccessRights(slug),
        enabled: !!slug,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 5 * 60 * 1000, // 5 минут
    });

    // Завантажуємо дані книги для перевірки власника
    const { data: book } = useQuery({
        queryKey: ['book', slug],
        queryFn: () => catalogAPI.fetchBook(slug),
        enabled: !!slug,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 5 * 60 * 1000, // 5 минут
    });

    // Заповнюємо форму поточними налаштуваннями
    useEffect(() => {
        if (accessRights) {
            setPermissions({
                view_permission: accessRights.view_permission || 'all',
                comment_book_permission: accessRights.comment_book_permission || 'all',
                comment_chapter_permission: accessRights.comment_chapter_permission || 'all',
                download_permission: accessRights.download_permission || 'all',
                rate_permission: accessRights.rate_permission || 'all',
            });
        }
    }, [accessRights]);

    const togglePermission = (permissionKey, roleKey) => {
        setPermissions((prev) => ({
            ...prev,
            [permissionKey]: roleKey,
        }));
    };

    const handleSave = async () => {
        if (!slug) {
            showError('Не вдалося визначити книгу');
            return;
        }

        // Перевіряємо права доступу перед збереженням
        if (book && userInfo) {
            const isOwner = book.owner === userInfo.id;
            if (!isOwner) {
                showError('У вас немає прав для зміни налаштувань доступу цієї книги');
                navigate(`/books/${slug}`);
                return;
            }
        }

        setIsSaving(true);
        try {
            await catalogAPI.updateBookAccessRights(slug, permissions);
            success('Налаштування доступу успішно збережено');
        } catch (error) {
            console.error('Помилка при збереженні налаштувань доступу:', error);
            showError(error.message || 'Помилка при збереженні налаштувань доступу');
        } finally {
            setIsSaving(false);
        }
    };

    if (accessRightsLoading) {
        return <div>Завантаження налаштувань доступу...</div>;
    }

    return (
        <>
            <table className={styles.permissionsTable}>
                <thead>
                    <tr>
                        <th>Що можуть робити</th>
                        {ROLES.map((role) => (
                            <th key={role.key}>{role.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {PERMISSIONS.map((perm) => (
                        <tr key={perm.key}>
                            <td>{perm.label}</td>
                            {ROLES.map((role) => (
                                <td key={role.key}>
                                    <Form.Check
                                        type="checkbox"
                                        checked={permissions[perm.key] === role.key}
                                        onChange={() => togglePermission(perm.key, role.key)}
                                        id={`${perm.key}-${role.key}`}
                                        style={{ justifyContent: "center" }}
                                        className="adult-content-checkbox"
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className={styles.AccessRightsSave}>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    <img src={CheckSave} alt="Save" />
                    <span>{isSaving ? 'Збереження...' : 'Зберегти'}</span>
                </button>
            </div>
        </>
    )
}

export default AccessRights;
