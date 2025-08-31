import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Form } from "react-bootstrap";
import { useToast } from "../../components/CustomToast";
import { catalogAPI } from '../../api/catalog/catalogAPI';
import TranslatorAccessGuard from "../components/TranslatorAccessGuard";
import "../css/BookCreate.css";
import ArrowCreate from "./img/arrowCreate.png";
import { BreadCrumb } from '../../main/components/BreadCrumb';
import Content from "./img/18.svg";
import styles from '../../catalog/css/BookDetailRouter.module.css';
import Upload from "./img/img_upload.png";
import BorderCreate from '../../main/pages/img/border-create.svg';

const CreateBook = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.auth.user);
  const userInfo = useSelector(state => state.auth.userInfo);
  const { success, error: showError } = useToast();

  // Функция для перевода названий полей на украинский
  const getFieldDisplayName = (fieldName) => {
    const fieldNames = {
      'title': 'Назва книги',
      'title_en': 'Назва мовою перекладу',
      'author': 'Автор',
      'description': 'Опис',
      'genres': 'Жанри',
      'tags': 'Теги',
      'country': 'Країна',
      'fandoms': 'Фендом',
      'book_type': 'Тип твору',
      'translation_status': 'Статус перекладу',
      'original_status': 'Статус оригіналу',
      'image': 'Зображення'
    };
    return fieldNames[fieldName] || fieldName;
  };

  // Логування для діагностики - только при изменении состояния
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('BookCreate: Состояние компонента изменилось:', {
        currentUser: !!currentUser,
        userInfo: !!userInfo,
        userRole: userInfo?.role,
        isAuthenticated: currentUser && Object.keys(currentUser).length > 0,
        userInfoKeys: userInfo ? Object.keys(userInfo).length : 0
      });
    }
  }, [currentUser, userInfo]);
  
  const [formData, setFormData] = useState({
    title: "",
    title_en: "",
    book_type: "TRANSLATION",
    author: "",
    description: "",
    genres: [],
    tags: [],
    country: "",
    fandoms: [],
    adult_content: false,
    image: null,
    translation_status: "TRANSLATING",
    original_status: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Получаем списки для селектов
  const bookTypes = [
    { value: "TRANSLATION", label: "Переклад" },
    { value: "AUTHOR", label: "Авторська" },
  ];
  
  const { data: genres, isLoading: genresLoading } = useQuery({
    queryKey: ["genres"],
    queryFn: catalogAPI.fetchGenres,
  });
  
  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: catalogAPI.fetchTags,
  });
  
  const { data: countries, isLoading: countriesLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: catalogAPI.fetchCountries,
  });
  
  const { data: fandoms, isLoading: fandomsLoading } = useQuery({
    queryKey: ["fandoms"],
    queryFn: catalogAPI.fetchFandoms,
  });

  const adultTag = tags?.find((tag) => tag.name === "18+");
  const adultTagId = adultTag?.id;

  // Функция для обновления adult_content на основе выбранных тегов
  const updateAdultContent = (newTags) => {
    const hasAdultTag = newTags.includes(adultTagId);
    setFormData(prev => ({
      ...prev,
      adult_content: hasAdultTag
    }));
  };

  const createBookMutation = useMutation({
    mutationFn: catalogAPI.createBook,
    onSuccess: (data) => {
      console.log('BookCreate: Книга успешно создана:', data);
      success("Книга успішно створена!");
      setIsSubmitting(false);
      navigate("/catalog");
    },
    onError: (error) => {
      console.error('BookCreate: Ошибка создания книги:', error);
      
      // Теперь catalogAPI.js возвращает детальные ошибки в error.message
      let errorMessage = error.message || 'Помилка при створенні книги';
      
      // Дополнительная обработка для других типов ошибок
      if (error.response?.status === 401) {
        errorMessage = 'Необхідна авторизація. Спробуйте увійти знову';
        setIsSubmitting(false); // Сбрасываем только для ошибок авторизации
      } else if (error.response?.status === 403) {
        errorMessage = 'У вас немає прав для створення книг';
        setIsSubmitting(false); // Сбрасываем только для ошибок прав доступа
      } else if (error.response?.status >= 500) {
        errorMessage = 'Помилка сервера. Спробуйте пізніше';
        // НЕ сбрасываем isSubmitting для технических ошибок сервера
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = 'Помилка з\'єднання з сервером. Перевірте підключення до інтернету';
        // НЕ сбрасываем isSubmitting для сетевых ошибок
      } else {
        // Для всех остальных ошибок (400, 422 и т.д.) сбрасываем
        setIsSubmitting(false);
      }
      
      showError(errorMessage);
    },
  });

  const translationStatuses = [
    { value: "TRANSLATING", label: "Перекладається" },
    { value: "WAITING", label: "В очікуванні розділів" },
    { value: "PAUSED", label: "Перерва" },
    { value: "ABANDONED", label: "Покинутий" },
  ];

  const originalStatuses = [
    { value: "ONGOING", label: "Виходить" },
    { value: "STOPPED", label: "Припинено" },
    { value: "COMPLETED", label: "Завершений" },
  ];

  const validateForm = () => {
    const newErrors = {};
    console.log('BookCreate: Валидация формы:', formData);

    if (!formData.title?.trim()) {
      newErrors.title = "Назва книги обов\'язкова";
    }

    if (!formData.author?.trim()) {
      newErrors.author = "Ім\'я автора обов\'язкове";
    }

    if (formData.description && formData.description.split(" ").length > 250) {
      newErrors.description = "Опис не може перевищувати 250 слів";
    }

    if (!formData.genres.length) {
      newErrors.genres = "Виберіть хоча б один жанр";
    }

    if (!formData.country) {
      newErrors.country = "Виберіть країну";
    }

    if (!formData.original_status) {
      newErrors.original_status = "Оберіть статус випуску оригіналу";
    }

    if (formData.book_type === "TRANSLATION" && !formData.translation_status) {
      newErrors.translation_status = "Оберіть статус перекладу";
    } else if (formData.book_type === "TRANSLATION" && formData.translation_status) {
      // Запрещаем создание книг с недопустимыми статусами
      const invalidStatuses = ['Перерва', 'Закінчено', 'Зупинено', 'ABANDONED', 'COMPLETED', 'STOPPED'];
      if (invalidStatuses.includes(formData.translation_status)) {
        newErrors.translation_status = `Не можна створити книгу зі статусом '${formData.translation_status}'. Для нових книг використовуйте статус 'Перекладається' або 'TRANSLATING'`;
      }
    }

    console.log('BookCreate: Ошибки валидации:', newErrors);
    
    // Если есть ошибки, показываем детальное сообщение
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join(', ');
      showError(`Помилка: ${errorMessages}`);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showError("Будь ласка, завантажте зображення");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        showError("Розмір файлу не повинен перевищувати 5MB");
        return;
      }
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBookTypeChange = (e) => {
    const newType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      book_type: newType,
      translation_status: newType === "AUTHOR" ? null : "TRANSLATING",
    }));
  };

  // Обработчик выбора жанров
  const handleGenreClick = (genreId) => {
    if (!genreId) return;
    
    setFormData(prev => {
      const newGenres = prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId];
      
      return {
        ...prev,
        genres: newGenres
      };
    });
  };

  // Обработчик выбора тегов
  const handleTagClick = (tagId) => {
    if (!tagId) return;
    
    setFormData(prev => {
      const newTags = prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId];
      
      // Обновляем adult_content на основе выбранных тегов
      updateAdultContent(newTags);
      
      return {
        ...prev,
        tags: newTags
      };
    });
  };

  // Обработчик выбора фандомов
  const handleFandomClick = (fandomId) => {
    if (!fandomId) return;
    
    setFormData(prev => {
      const newFandoms = prev.fandoms.includes(fandomId)
        ? prev.fandoms.filter(id => id !== fandomId)
        : [...prev.fandoms, fandomId];
      
      return {
        ...prev,
        fandoms: newFandoms
      };
    });
  };

  // Обработчик изменения adult_content чекбокса
  const handleAdultContentChange = (isChecked) => {
    setFormData(prev => {
      let newTags = [...prev.tags];
      
      if (isChecked && adultTagId && !newTags.includes(adultTagId)) {
        newTags = [...newTags, adultTagId];
      } else if (!isChecked && adultTagId) {
        newTags = newTags.filter(id => id !== adultTagId);
      }
      
      return {
        ...prev,
        adult_content: isChecked,
        tags: newTags
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('BookCreate: Попытка отправки формы');
    
    if (isSubmitting) {
      console.log('BookCreate: Форма уже отправляется, пропускаем');
      return;
    }
    
    if (!validateForm()) {
      console.log('BookCreate: Валидация не пройдена, показываем ошибки');
      return;
    }

    console.log('BookCreate: Форма валидна, начинаем отправку');
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        translation_status:
          formData.book_type === "AUTHOR" ? null : formData.translation_status,
      };

      console.log('BookCreate: Отправляем данные:', submitData);
      await createBookMutation.mutateAsync(submitData);
    } catch (error) {
      console.error('BookCreate: Критическая ошибка при создании книги:', error);
      // Ошибка уже обработана в onError мутации
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      translation_status: prev.book_type === "AUTHOR" ? null : "TRANSLATING",
    }));
  }, [formData.book_type]);

  // Показываем загрузку, если данные еще не загружены
  if (genresLoading || tagsLoading || countriesLoading || fandomsLoading) {
    return (
      <TranslatorAccessGuard>
        <div className="BookCreateContainer">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Завантаження даних...</p>
          </div>
        </div>
      </TranslatorAccessGuard>
    );
  }

  return (
    <TranslatorAccessGuard>
      <div className="BookCreateContainer">
        <BreadCrumb
          items={[
            { href: "/", label: "Головна" },
            {
              href: "/create-translation",
              label: "Створення",
            },
          ]}
        />
        <div className="first-block-create-book">
        <div className="name-book">
          <Form.Group className="mb-3 block-name-book">
            <Form.Label className="name-book-label">
              Назва мовою оригіналу
            </Form.Label>
            <div className="container-name-book">
              {" "}
              <Form.Control
                className="input-name-book"
                type="text"
                placeholder="Введіть назву книги мовою оригіналу"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3 block-name-book">
            <Form.Label className="name-book-label">
              Назва мовою перекладу
            </Form.Label>
            <div className="container-name-book">
              {" "}
              <Form.Control
                className="input-name-book"
                type="text"
                placeholder="Введіть назву книги мовою перекладу"
                value={formData.title_en}
                onChange={(e) =>
                  setFormData({ ...formData, title_en: e.target.value })
                }
              />
            </div>
          </Form.Group>
        </div>
        <div className="midle-first-block">
          <Form.Group className="mb-3 block-name-book">
            <Form.Label className="name-book-label">Тип твору</Form.Label>
            <div className="container-name-book">
              <Form.Select
                className="input-name-book"
                value={formData.book_type}
                onChange={handleBookTypeChange}
                required
              >
                {bookTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </div>
          </Form.Group>

          <Form.Group className="mb-3 block-name-book">
            <Form.Label className="name-book-label">Автор твору</Form.Label>
            <div className="container-name-book">
              {" "}
              <Form.Control
                className="input-name-book"
                type="text"
                placeholder="Введіть ім\'я автора твору"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                required
              />
            </div>
          </Form.Group>
          <Form.Group className="mb-3 block-name-book">
            <Form.Label className="name-book-label">Статус випуску</Form.Label>
            <div className="container-name-book">
              {" "}
              <Form.Select
                className="input-name-book"
                value={formData.original_status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    original_status: e.target.value,
                  })
                }
              >
                <option value="">Оберіть статус</option>
                {originalStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Form.Select>
            </div>
          </Form.Group>
          {formData.book_type === "TRANSLATION" && (
            <Form.Group className="mb-3 block-name-book">
              <Form.Label className="name-book-label">
                Статус перекладу
              </Form.Label>
              <div className="container-name-book">
                <Form.Select
                  className="input-name-book"
                  value={formData.translation_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translation_status: e.target.value,
                    })
                  }
                >
                  <option value="">Оберіть статус</option>
                  {translationStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Form.Group>
          )}
          <Form.Group className="mb-3 block-name-book">
            <Form.Label className="name-book-label">Країна твору</Form.Label>
            <div className="container-name-book">
              <Form.Select
                className="input-name-book"
                value={formData.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    country: e.target.value,
                  })
                }
                required
              >
                <option value="">Оберіть країну</option>
                {countries?.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </Form.Select>
            </div>
          </Form.Group>
          <Form.Group className="mb-3 block-name-book mobile">
            <Form.Check
              type="checkbox"
              id="adult_content_mobile"
              className={`adult-content-checkbox check-content  ${styles.chapterCheck}`}
              label="Присутній контент"
              checked={formData.adult_content}
              onChange={(e) => handleAdultContentChange(e.target.checked)}
            />
            <img src={Content} />
          </Form.Group>
        </div>
        <div className="last-block-first">
          <Form.Group className="mb-3 block-name-book">
            <Form.Label style={{ top: "-40px" }} className="name-book-label">
              Опис/рецензія
            </Form.Label>
            <Form.Control
              className="input-name-book"
              style={{ minHeight: "390px" }}
              as="textarea"
              rows={3}
              placeholder="Введіть опис або рецензію книги (максимум 250 слів)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <Form.Text className="text-muted">
              {formData.description
                ? `${formData.description.split(" ").length}/250 слів`
                : "0/250 слів"}
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3 all-content">
            <Form.Check
              type="checkbox"
              id="adult_content_desktop"
              className={`adult-content-checkbox check-content ${styles.chapterCheck}`}
              label="Контент"
              checked={formData.adult_content}
              onChange={(e) => handleAdultContentChange(e.target.checked)}
            />
            <img src={Content} />
          </Form.Group>
        </div>
      </div>

      <div className="header-book-genres">
        <img src={BorderCreate} />
      </div>
      <Form.Group className="mb-3" style={{ position: "relative" }}>
        <Form.Label
          style={{ marginTop: "-18px", padding: "5px 50px" }}
          className="name-book-label genres"
        >
          Жанри
        </Form.Label>
        <div className="genres-container input-name-book">
          {genres?.map((genre) => (
            <div
              key={genre.id}
              className={`genre-item ${
                formData.genres.includes(genre.id) ? "selected" : ""
              }`}
              onClick={() => handleGenreClick(genre.id)}
            >
              {genre.name}
            </div>
          ))}
        </div>
      </Form.Group>
      
      <div className="tags-all">
        <Form.Group className="mb-3" style={{ position: "relative" }}>
          <Form.Label
            style={{ marginTop: "-18px", padding: "5px 50px" }}
            className="name-book-label tags"
          >
            Теги
          </Form.Label>
          <div
            className="tags-container input-name-book"
            style={{ padding: "40px 30px" }}
          >
            <div className="sub-container">
              {" "}
              <div className="sub-title-tags">
                <span>СВІТИ ТА ЕПОХИ:</span>
                <div className="line-sub-title-tags"></div>
              </div>
              <div className="all-sub-ell">
                {tags?.slice(0, 20).map((tag) => (
                  <div
                    key={tag.id}
                    className={`tag-item ${
                      formData.tags.includes(tag.id) ? "selected" : ""
                    }`}
                    onClick={() => handleTagClick(tag.id)}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="sub-container">
              {" "}
              <div className="sub-title-tags">
                <span>ФЕНТАЗІ ТА МАГІЯ:</span>
                <div className="line-sub-title-tags"></div>
              </div>
              <div className="all-sub-ell">
                {tags?.slice(0, 20).map((tag) => (
                  <div
                    key={tag.id}
                    className={`tag-item ${
                      formData.tags.includes(tag.id) ? "selected" : ""
                    }`}
                    onClick={() => handleTagClick(tag.id)}
                  >
                    {tag.name}
                  </div>
                ))}
                <div className="container-button">
                  {" "}
                  <button>
                    <span>Показати всі</span>
                    <img src={ArrowCreate} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Form.Group>
      </div>
      
      <div className="header-book-genres">
        <img src={BorderCreate} />
      </div>
      <Form.Group className="mb-3" style={{ position: "relative" }}>
        <Form.Label style={{ top: "-18px" }} className="name-book-label fandom">
          Фендом
        </Form.Label>
        <div
          style={{ marginTop: "72px" }}
          className="fandoms-container input-name-book"
        >
          {fandoms?.map((fandom) => (
            <div
              key={fandom.id}
              className={`fandom-item ${
                formData.fandoms.includes(fandom.id) ? "selected" : ""
              }`}
              onClick={() => handleFandomClick(fandom.id)}
            >
              {fandom.name}
            </div>
          ))}
        </div>
      </Form.Group>

      <div className="all-img">
        <div className="img-book">
          <div className="general-img" style={{ position: "relative" }}>
            <Form.Group
              style={{ height: "390px", width: "288px", padding: "30px" }}
              className="mb-3 input-name-book general-input-name-book"
            >
              <Form.Label
                style={{ top: "-18px", left: "-4px" }}
                className="name-book-label img_book"
              >
                Основне зображення
              </Form.Label>

              <div className="custom-file-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="fileInput"
                  className="hidden-input "
                />
                <label
                  htmlFor="fileInput"
                  className="file-label input-img general"
                  style={{
                    ...(imagePreview && {
                      width: '100%',
                      height: '100%',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    })
                  }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="img-fluid"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 'inherit'
                      }}
                    />
                  ) : (
                    <div className="circle_upload">
                      <img src={Upload} alt="Загрузить" className="upload-icon" />
                      <span>Вибрати зображення</span>
                    </div>
                  )}
                </label>
              </div>
            </Form.Group>
          </div>
        </div>
      </div>
      
      {/* Кнопка публикации - размещена после блока изображений */}
      <div className="all-sub-img" style={{ marginTop: '20px', textAlign: 'center' }}>
        <div className="one-sub-img"></div>
        <button 
          type="submit"
          className="save-book"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <img className="top-button" src={BorderCreate} />
          <span>{isSubmitting ? 'Створення...' : 'Опублікувати переклад'}</span>
          <img className="bottom-button" src={BorderCreate} />
        </button>
      </div>
      </div>
    </TranslatorAccessGuard>
  );
};

export default CreateBook;
