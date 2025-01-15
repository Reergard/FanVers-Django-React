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
    const [isPaid, setIsPaid] = useState(false);
    const [price, setPrice] = useState('1.00');

    useEffect(() => {
        const fetchChapterData = async () => {
            try {
                const data = await editorsAPI.getChapterForEdit(chapterId);
                console.log('Fetched chapter data:', data);
                setTitle(data.title);
                setSelectedVolume(data.volume || '');
                setIsPaid(data.is_paid);
                if (data.is_paid) {
                    setPrice(data.price ? data.price.toString() : '1.00');
                }
                setOriginalData(data);

                const bookSlug = data.book_slug;
                const volumesResponse = await axios.get(
                    `http://localhost:8000/api/catalog/books/${bookSlug}/volumes/`
                );
                setVolumes(volumesResponse.data);
            } catch (error) {
                console.error('Error fetching chapter data:', error);
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

    const handleStatusChange = (e) => {
        const newIsPaid = e.target.checked;
        setIsPaid(newIsPaid);
        if (!newIsPaid) {
            setPrice('1.00');
        }
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;
        if (value === '' || (parseFloat(value) > 0 && parseFloat(value) <= 1000)) {
            setPrice(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isPaid) {
                const priceValue = parseFloat(price);
                if (!price || priceValue <= 0 || isNaN(priceValue)) {
                    setError('Вкажіть коректну вартість глави');
                    return;
                }
                if (priceValue > 1000) {
                    setError('Максимальна вартість глави - 1000 грн');
                    return;
                }
            }

            const formData = new FormData();
            
            formData.append('title', title);
            formData.append('is_paid', isPaid);
            formData.append('price', isPaid ? price : '1.00');
            
            if (selectedVolume !== originalData.volume) {
                formData.append('volume', selectedVolume || '');
            }
            
            if (isFileChanged && file) {
                formData.append('file', file);
            }

            console.log('Sending form data:', {
                title,
                is_paid: isPaid,
                price: isPaid ? price : '1.00',
                volume: selectedVolume
            });

            const response = await editorsAPI.updateChapter(chapterId, formData);
            console.log('Update response:', response);

            navigate(`/books/${originalData.book_slug}`);
            
        } catch (error) {
            console.error('Error updating chapter:', error);
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

                            <div className="chapter-status-settings">
                                <label className="chapter-status-toggle">
                                    <input
                                        type="checkbox"
                                        checked={isPaid}
                                        onChange={handleStatusChange}
                                    />
                                    Закритий доступ
                                </label>
                            </div>

                            {isPaid && (
                                <div className="form-group">
                                    <label htmlFor="price">Вартість глави:</label>
                                    <input
                                        type="number"
                                        id="price"
                                        className="form-control"
                                        min="0.01"
                                        max="1000"
                                        step="0.01"
                                        value={price}
                                        onChange={handlePriceChange}
                                        required
                                        placeholder="Введіть вартість"
                                    />
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