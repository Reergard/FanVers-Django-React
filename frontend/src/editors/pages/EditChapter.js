import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { editorsAPI } from '../../api/editors/editorsAPI';
import axios from 'axios';
import { Container } from 'react-bootstrap';

const EditChapter = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [volumes, setVolumes] = useState([]);
    const [selectedVolume, setSelectedVolume] = useState('');
    const [error, setError] = useState('');
    const [originalData, setOriginalData] = useState(null);
    const [isFileChanged, setIsFileChanged] = useState(false);

    useEffect(() => {
        const fetchChapterData = async () => {
            try {
                const data = await editorsAPI.getChapterForEdit(chapterId);
                setTitle(data.title);
                setSelectedVolume(data.volume || '');
                setOriginalData(data);

                // Загружаем список томов для книги
                const bookSlug = data.book_slug;
                const volumesResponse = await axios.get(
                    `http://localhost:8000/api/catalog/books/${bookSlug}/volumes/`
                );
                setVolumes(volumesResponse.data);
            } catch (error) {
                setError('Помилка при завантаженні даних розділу');
            }
        };

        fetchChapterData();
    }, [chapterId]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            setError('Будь ласка, завантажте файл у форматі .docx');
            return;
        }
        setFile(selectedFile);
        setIsFileChanged(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const formData = new FormData();
            
            if (title !== originalData.title) {
                formData.append('title', title);
            }
            
            if (selectedVolume !== originalData.volume) {
                formData.append('volume', selectedVolume || '');
            }
            
            if (isFileChanged && file) {
                formData.append('file', file);
            }

            if (formData.entries().next().done) {
                setError('Немає змін для збереження');
                return;
            }

            await editorsAPI.updateChapter(chapterId, formData);
            
            // Возвращаемся на страницу книги
            navigate(`/books/${originalData.book_slug}`);
            
        } catch (error) {
            setError(error.message || 'Помилка при оновленні розділу');
        }
    };

    if (!originalData) {
        return <div>Завантаження...</div>;
    }

    return (
        <section>
            <Container fluid className="catalog-section" id="catalog">
                <Container className="catalog-content">
                    <div>
                        <h2>Редагувати розділ</h2>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="title">Назва розділу:</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="file">Завантажити новий .docx файл:</label>
                                <input
                                    type="file"
                                    id="file"
                                    accept=".docx"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {volumes.length > 0 && (
                                <div>
                                    <label htmlFor="volume">Том:</label>
                                    <select
                                        id="volume"
                                        value={selectedVolume}
                                        onChange={(e) => setSelectedVolume(e.target.value)}
                                    >
                                        <option value="">Виберіть том</option>
                                        {volumes.map((volume) => (
                                            <option key={volume.id} value={volume.id}>
                                                {volume.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button type="submit">Зберегти зміни</button>
                        </form>
                    </div>
                </Container>
            </Container>
        </section>
    );
};

export default EditChapter; 