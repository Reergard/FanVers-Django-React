import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Form } from "react-bootstrap";
import { useToast } from "../../../components/CustomToast";
import { catalogAPI } from '../../../api/catalog/catalogAPI';
import TranslatorAccessGuard from "../../components/TranslatorAccessGuard";
import "../../css/SettingsBooks.css";
import ArrowCreate from "../img/arrowCreate.png";

import Content from "../img/18.svg";
import styles from '../../css/BookDetailRouter.module.css';
import Upload from "../img/img_upload.png";
import BorderCreate from '../../../main/pages/img/border-create.svg';

const GeneralSettings = () => {
  const navigate = useNavigate();
  const { slug } = useParams(); // Получаем slug книги из URL
  const currentUser = useSelector(state => state.auth.user);
  const userInfo = useSelector(state => state.auth.userInfo);
  const { success, error: showError } = useToast();
  const queryClient = useQueryClient();

  // Загружаем данные существующей книги
  const { data: book, isLoading: bookLoading, error: bookError } = useQuery({
    queryKey: ['book', slug],
    queryFn: () => catalogAPI.fetchBook(slug),
    enabled: !!slug,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Логування для діагностики - только при изменении состояния
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('GeneralSettings: Состояние компонента изменилось:', {
        currentUser: !!currentUser,
        userInfo: !!userInfo,
        userRole: userInfo?.role,
        isAuthenticated: currentUser && Object.keys(currentUser).length > 0,
        userInfoKeys: userInfo ? Object.keys(userInfo).length : 0,
        bookSlug: slug,
        bookData: !!book
      });
    }
  }, [currentUser, userInfo, slug, book]);
  
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

  // Заполняем форму данными из API при загрузке книги
  useEffect(() => {
    if (book) {
      console.log('GeneralSettings: Заполняем форму данными книги:', book);
      setFormData({
        title: book.title || "",
        title_en: book.title_en || "",
        book_type: book.book_type || "TRANSLATION",
        author: book.author || "",
        description: book.description || "",
        genres: book.genres?.map(g => g.id) || [],
        tags: book.tags?.map(t => t.id) || [],
        country: book.country?.id || "",
        fandoms: book.fandoms?.map(f => f.id) || [],
        adult_content: book.adult_content || false,
        image: null, // Не изменяем изображение по умолчанию
        translation_status: book.translation_status || "TRANSLATING",
        original_status: book.original_status || "",
      });

      // Устанавливаем превью текущего изображения
      if (book.image) {
        setImagePreview(book.image);
      }
    }
  }, [book]);

  // Получаем списки для селектов
  const bookTypes = [
    { value: "TRANSLATION", label: "Переклад" },
    { value: "AUTHOR", label: "Авторська" },
  ];
  
  const { data: genres, isLoading: genresLoading } = useQuery({
    queryKey: ["genres"],
    queryFn: catalogAPI.fetchGenres,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 10 * 60 * 1000, // 10 минут
  });
  
  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: catalogAPI.fetchTags,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 10 * 60 * 1000, // 10 минут
  });
  
  const { data: countries, isLoading: countriesLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: catalogAPI.fetchCountries,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 10 * 60 * 1000, // 10 минут
  });
  
  const { data: fandoms, isLoading: fandomsLoading } = useQuery({
    queryKey: ["fandoms"],
    queryFn: catalogAPI.fetchFandoms,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 10 * 60 * 1000, // 10 минут
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

  // Мутация для обновления книги
  const updateBookMutation = useMutation({
    mutationFn: (bookData) => catalogAPI.updateBook(slug, bookData),
    onSuccess: (data) => {
      console.log('GeneralSettings: Книга успешно обновлена:', data);
      success("Книга успішно оновлена!");
      setIsSubmitting(false);
      
      // Обновляем кеш
      queryClient.invalidateQueries(['book', slug]);
      
      // Переходим на страницу книги
      navigate(`/books/${slug}`);
    },
    onError: (error) => {
      console.error('GeneralSettings: Ошибка обновления книги:', error);
      
      let errorMessage = error.message || 'Помилка при оновленні книги';
      
      if (error.response?.status === 401) {
        errorMessage = 'Необхідна авторизація. Спробуйте увійти знову';
        setIsSubmitting(false);
      } else if (error.response?.status === 403) {
        errorMessage = 'У вас немає прав для редагування цієї книги';
        setIsSubmitting(false);
      } else if (error.response?.status >= 500) {
        errorMessage = 'Помилка сервера. Спробуйте пізніше';
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = 'Помилка з\'єднання з сервером. Перевірте підключення до інтернету';
      } else {
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
    console.log('GeneralSettings: Валидация формы:', formData);

    // Поля title, author, country, book_type теперь только для чтения, не валидируем их
    // if (!formData.title?.trim()) {
    //   newErrors.title = "Назва книги обов\'язкова";
    // }

    // if (!formData.author?.trim()) {
    //   newErrors.author = "Ім\'я автора обов\'язкове";
    // }

    if (formData.description && formData.description.split(" ").length > 250) {
      newErrors.description = "Опис не може перевищувати 250 слів";
    }

    if (!formData.genres.length) {
      newErrors.genres = "Виберіть хоча б один жанр";
    }

    // if (!formData.country) {
    //   newErrors.country = "Виберіть країну";
    // }

    if (!formData.original_status) {
      newErrors.original_status = "Оберіть статус випуску оригіналу";
    }

    if (formData.book_type === "TRANSLATION" && !formData.translation_status) {
      newErrors.translation_status = "Оберіть статус перекладу";
    }

    console.log('GeneralSettings: Ошибки валидации:', newErrors);
    
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
    
    console.log('GeneralSettings: Попытка обновления книги');
    
    // Проверяем права доступа перед отправкой
    if (book && userInfo) {
      const isOwner = book.owner === userInfo.id;
      if (!isOwner) {
        showError('У вас немає прав для редагування цієї книги');
        navigate(`/books/${slug}`);
        return;
      }
    }
    
    if (isSubmitting) {
      console.log('GeneralSettings: Форма уже отправляется, пропускаем');
      return;
    }
    
    if (!validateForm()) {
      console.log('GeneralSettings: Валидация не пройдена, показываем ошибки');
      return;
    }

    console.log('GeneralSettings: Форма валидна, начинаем обновление');
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        translation_status:
          formData.book_type === "AUTHOR" ? null : formData.translation_status,
      };

      console.log('GeneralSettings: Отправляем данные для обновления:', submitData);
      await updateBookMutation.mutateAsync(submitData);
    } catch (error) {
      console.error('GeneralSettings: Критическая ошибка при обновлении книги:', error);
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      translation_status: prev.book_type === "AUTHOR" ? null : "TRANSLATING",
    }));
  }, [formData.book_type]);

  // Показываем загрузку, если данные еще не загружены
  if (bookLoading || genresLoading || tagsLoading || countriesLoading || fandomsLoading) {
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

  // Показываем ошибку, если книга не найдена
  if (bookError) {
    return (
      <TranslatorAccessGuard>
        <div className="BookCreateContainer">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Помилка завантаження книги: {bookError.message}</p>
          </div>
        </div>
      </TranslatorAccessGuard>
    );
  }

  return (
    <TranslatorAccessGuard>
      <div className="BookCreateContainer">

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
                 readOnly
                 style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
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
                readOnly
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
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
                disabled
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
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
                readOnly
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
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
                disabled
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
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
      
      {/* Кнопка сохранения изменений */}
      <div className="all-sub-img" style={{ marginTop: '20px', textAlign: 'center' }}>
        <div className="one-sub-img"></div>
        <button 
          type="submit"
          className="save-book"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <img className="top-button" src={BorderCreate} />
          <span>{isSubmitting ? 'Збереження...' : 'Зберегти зміни'}</span>
          <img className="bottom-button" src={BorderCreate} />
        </button>
      </div>
      </div>
    </TranslatorAccessGuard>
  );
};

export default GeneralSettings;
