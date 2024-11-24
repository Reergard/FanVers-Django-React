import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dropdown, Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { usersAPI } from '../../api/users/usersAPI';
import { useQueryClient } from '@tanstack/react-query';

const ChapterNavigation = ({ bookSlug, currentChapter, prevChapter, nextChapter, allChapters }) => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [targetChapter, setTargetChapter] = useState(null);
    const profile = useSelector(state => state.auth.profile);
    const queryClient = useQueryClient();

    if (!currentChapter || !allChapters) {
        return null;
    }

    const handlePurchaseChapter = async (chapterId) => {
        try {
            console.log('Покупка главы:', { bookSlug, chapterId, targetChapter });
            const response = await usersAPI.purchaseChapter(chapterId);
            
            if (response && (response.is_purchased || response.message === 'Глава успішно придбана')) {
                console.log('Глава успешно куплена, переходим на страницу главы');
                
                queryClient.invalidateQueries(['chapters', bookSlug]);
                queryClient.invalidateQueries(['profile']);
                
                setShowModal(false);
                
                if (targetChapter && targetChapter.slug) {
                    const chapterUrl = `/books/${bookSlug}/chapters/${targetChapter.slug}`;
                    console.log('Переходим по URL:', chapterUrl);
                    navigate(chapterUrl);
                    window.location.reload();
                }
            } else {
                console.error('Неожиданный ответ:', response);
                alert('Помилка при купівлі глави');
            }
        } catch (error) {
            console.error('Ошибка при покупке главы:', error);
            if (error.response?.status === 400) {
                if (error.response.data.error === 'Недостатній баланс') {
                    alert('Баланс ваших Доступних розділів для відкриття досяг 0. Аби мати змогу купувати закриті розділи вам слід поповнити Доступні розділи на сторінці Профіля');
                } else {
                    alert(error.response.data.error);
                }
            } else {
                alert('Помилка при купівлі глави');
            }
            setShowModal(false);
        }
    };

    const handleChapterChange = (chapter) => {
        if (chapter.is_paid && !chapter.is_purchased) {
            setTargetChapter(chapter);
            setShowModal(true);
        } else {
            navigate(`/books/${bookSlug}/chapters/${chapter.slug}`);
        }
    };

    return (
        <>
            <div className="chapter-navigation d-flex justify-content-between align-items-center my-3">
                <Button
                    variant="outline-primary"
                    onClick={() => prevChapter && handleChapterChange(prevChapter)}
                    disabled={!prevChapter}
                >
                    &larr; Предыдущая глава
                </Button>

                <Dropdown>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                        {currentChapter ? currentChapter.title : "Глава"}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        {allChapters.map((chapter) => (
                            <Dropdown.Item 
                                key={chapter.slug}
                                onClick={() => handleChapterChange(chapter)}
                                active={currentChapter && chapter.slug === currentChapter.slug}
                            >
                                {chapter.title}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

                <Button
                    variant="outline-primary"
                    onClick={() => nextChapter && handleChapterChange(nextChapter)}
                    disabled={!nextChapter}
                >
                    Следующая глава &rarr;
                </Button>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Закрытая глава</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Ви ще не придбали цей розділ. Аби продовжити читання та придбати цей розділ натисніть КУПИТИ, або натисніть Повернутися</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="primary" 
                        onClick={() => handlePurchaseChapter(targetChapter.id)}
                        disabled={profile?.balance <= 0}
                    >
                        КУПИТИ
                    </Button>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Повернутися
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ChapterNavigation;
