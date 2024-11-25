import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import '../css/BookCreate.css';

const queryClient = new QueryClient();

const CreateBook = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        title_en: '',
        author: '',
        description: '',
        genres: [],
        tags: [],
        country: '',
        fandoms: [],
        adult_content: false,
        image: null,
        translation_status: 'TRANSLATING',
        original_status: '',
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});

    // Получаем списки для селектов
    const { data: genres } = useQuery({
        queryKey: ['genres'],
        queryFn: catalogAPI.fetchGenres
    });
    const { data: tags } = useQuery({
        queryKey: ['tags'],
        queryFn: catalogAPI.fetchTags
    });
    const { data: countries } = useQuery({
        queryKey: ['countries'],
        queryFn: catalogAPI.fetchCountries
    });
    const { data: fandoms } = useQuery({
        queryKey: ['fandoms'],
        queryFn: catalogAPI.fetchFandoms
    });

    const createBookMutation = useMutation({
        mutationFn: catalogAPI.createBook,
        onSuccess: () => {
            toast.success('Книга успішно створена!');
            navigate('/catalog');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const translationStatuses = [
        { value: 'TRANSLATING', label: 'Перекладається' },
        { value: 'WAITING', label: 'В очікуванні розділів' },
        { value: 'PAUSED', label: 'Перерва' },
        { value: 'ABANDONED', label: 'Покинутий' },
    ];

    const originalStatuses = [
        { value: 'ONGOING', label: 'Виходить' },
        { value: 'STOPPED', label: 'Припинено' },
        { value: 'COMPLETED', label: 'Завершений' },
    ];

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title) {
            newErrors.title = "Назва книги обов'язкова";
        }
        
        if (!formData.author) {
            newErrors.author = "Ім'я автора обов'язкове";
        }
        
        if (formData.description && formData.description.split(' ').length > 250) {
            newErrors.description = 'Опис не може перевищувати 250 слів';
        }
        
        if (!formData.genres.length) {
            newErrors.genres = 'Виберіть хоча б один жанр';
        }
        
        if (!formData.country) {
            newErrors.country = 'Виберіть країну';
        }
        
        if (!formData.original_status) {
            newErrors.original_status = "Оберіть статус випуску оригіналу";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Будь ласка, завантажте зображення');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                toast.error('Розмір файлу не повинен перевищувати 5MB');
                return;
            }
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Будь ласка, заповніть всі обов\'язкові поля');
            return;
        }

        try {
            createBookMutation.mutate(formData, {
                onSuccess: () => {
                    toast.success('Книга успішно створена!');
                    navigate('/catalog');
                },
                onError: (error) => {
                    let errorMessage = 'Помилка при створенні книги';
                    
                    if (error.response?.data) {
                        const missingFields = [];
                        const serverErrors = error.response.data;
                        
                        if (serverErrors.title) missingFields.push('назва');
                        if (serverErrors.author) missingFields.push('автор');
                        if (serverErrors.genres) missingFields.push('жанри');
                        if (serverErrors.country) missingFields.push('країна');
                        
                        if (missingFields.length > 0) {
                            errorMessage = `Не заповнені обов'язкові поля: ${missingFields.join(', ')}`;
                        } else if (typeof serverErrors === 'string') {
                            errorMessage = serverErrors;
                        }
                    }
                    
                    toast.error(errorMessage);
                }
            });
        } catch (error) {
            toast.error('Виникла неочікувана помилка');
        }
    };

    return (
        <Container className="book-create-container my-4">
            <h1>Створити нову книгу</h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Назва книги *</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        isInvalid={!!errors.title}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.title}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Назва мовою оригіналу</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.title_en}
                        onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Автор *</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        isInvalid={!!errors.author}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.author}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Опис</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        isInvalid={!!errors.description}
                    />
                    <Form.Text className="text-muted">
                        {formData.description ? `${formData.description.split(' ').length}/250 слів` : '0/250 слів'}
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">
                        {errors.description}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Зображення обкладинки</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {imagePreview && (
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="img-fluid mt-2"
                        />
                    )}
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Жанри *</Form.Label>
                    <div className="genres-container">
                        {genres?.map(genre => (
                            <div
                                key={genre.id}
                                className={`genre-item ${formData.genres.includes(genre.id) ? 'selected' : ''}`}
                                onClick={() => {
                                    const newGenres = formData.genres.includes(genre.id)
                                        ? formData.genres.filter(id => id !== genre.id)
                                        : [...formData.genres, genre.id];
                                    setFormData({ ...formData, genres: newGenres });
                                }}
                            >
                                {genre.name}
                            </div>
                        ))}
                    </div>
                    {errors.genres && (
                        <div className="text-danger mt-1">{errors.genres}</div>
                    )}
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Теги</Form.Label>
                    <div className="tags-container">
                        {tags?.map(tag => (
                            <div
                                key={tag.id}
                                className={`tag-item ${formData.tags.includes(tag.id) ? 'selected' : ''}`}
                                onClick={() => {
                                    const newTags = formData.tags.includes(tag.id)
                                        ? formData.tags.filter(id => id !== tag.id)
                                        : [...formData.tags, tag.id];
                                    setFormData({ ...formData, tags: newTags });
                                }}
                            >
                                {tag.name}
                            </div>
                        ))}
                    </div>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Країна *</Form.Label>
                    <div className="countries-container">
                        {countries?.map(country => (
                            <div
                                key={country.id}
                                className={`country-item ${formData.country === country.id ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, country: country.id })}
                            >
                                {country.name}
                            </div>
                        ))}
                    </div>
                    {errors.country && (
                        <div className="text-danger mt-1">{errors.country}</div>
                    )}
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Фендом</Form.Label>
                    <div className="fandoms-container">
                        {fandoms?.map(fandom => (
                            <div
                                key={fandom.id}
                                className={`fandom-item ${formData.fandoms === fandom.id ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, fandoms: fandom.id })}
                            >
                                {fandom.name}
                            </div>
                        ))}
                    </div>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Статус перекладу</Form.Label>
                    <Form.Select
                        value={formData.translation_status}
                        onChange={(e) => setFormData({ 
                            ...formData, 
                            translation_status: e.target.value 
                        })}
                        disabled  // Так как по умолчанию всегда "Перекладається"
                    >
                        {translationStatuses.map(status => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Статус випуску оригіналу *</Form.Label>
                    <Form.Select
                        value={formData.original_status}
                        onChange={(e) => setFormData({ 
                            ...formData, 
                            original_status: e.target.value 
                        })}
                        isInvalid={!!errors.original_status}
                    >
                        <option value="">Оберіть статус</option>
                        {originalStatuses.map(status => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {errors.original_status}
                    </Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" type="submit">
                    Створити книгу
                </Button>
            </Form>
        </Container>
    );
};

export default CreateBook; 