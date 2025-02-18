import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useQuery,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import { catalogAPI } from "../../api/catalog/catalogAPI";
import "../css/BookCreate.css";
import ArrowCreate from "./img/arrowCreate.png";
import { BreadCrumb } from "../../main/components/BreadCrumb";
import Content from "./img/18.svg";
import styles from "../../catalog/css/BookDetailRouter.module.css";
// import BorderCreate "../../"
import Upload from "./img/img_upload.png";
import BorderCreate from "../../main/pages/img/border-create.svg";
const queryClient = new QueryClient();

const CreateBook = () => {
  const navigate = useNavigate();
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
  const [errors, setErrors] = useState({});

  // Получаем списки для селектов
  const bookTypes = [
    { value: "TRANSLATION", label: "Переклад" },
    { value: "AUTHOR", label: "Авторська" },
  ];
  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: catalogAPI.fetchGenres,
  });
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: catalogAPI.fetchTags,
  });
  const { data: countries } = useQuery({
    queryKey: ["countries"],
    queryFn: catalogAPI.fetchCountries,
  });
  const { data: fandoms } = useQuery({
    queryKey: ["fandoms"],
    queryFn: catalogAPI.fetchFandoms,
  });

  const adultTag = tags?.find((tag) => tag.name === "18+");
  const adultTagId = adultTag?.id;

  const createBookMutation = useMutation({
    mutationFn: catalogAPI.createBook,
    onSuccess: () => {
      toast.success("Книга успішно створена!");
      navigate("/catalog");
    },
    onError: (error) => {
      toast.error(error.message);
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

    if (!formData.title) {
      newErrors.title = "Назва книги обов'язкова";
    }

    if (!formData.author) {
      newErrors.author = "Ім'я автора обов'язкове";
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Будь ласка, завантажте зображення");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        toast.error("Розмір файлу не повинен првищувати 5MB");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      translation_status:
        formData.book_type === "AUTHOR" ? null : formData.translation_status,
    };

    try {
      await createBookMutation.mutateAsync(submitData);
      toast.success("Книга успішно створена!");
      navigate("/catalog");
    } catch (error) {
      toast.error(error.message || "Помилка при створенні книги");
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      translation_status: prev.book_type === "AUTHOR" ? null : "TRANSLATING",
    }));
  }, [formData.book_type]);

  return (
    <Container>
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
        {/* <Form onSubmit={handleSubmit}> */}
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
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                isInvalid={!!errors.title}
              />
              <Form.Control.Feedback type="invalid">
                {errors.title}
              </Form.Control.Feedback>
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
                value={formData.title_en}
                onChange={(e) =>
                  setFormData({ ...formData, title_en: e.target.value })
                }
                isInvalid={!!errors.title}
              />
              <Form.Control.Feedback type="invalid">
                {errors.title}
              </Form.Control.Feedback>
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
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                isInvalid={!!errors.author}
              />
              <Form.Control.Feedback type="invalid">
                {errors.author}
              </Form.Control.Feedback>
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
                isInvalid={!!errors.original_status}
              >
                <option value="">Оберіть статус</option>
                {originalStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.original_status}
              </Form.Control.Feedback>
            </div>
          </Form.Group>
          <Form.Group className="mb-3 block-name-book">
            <Form.Label className="name-book-label">
              Статус перекладу
            </Form.Label>
            <div className="container-name-book">
              <Form.Select
                className="input-name-book"
                value={formData.original_status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    original_status: e.target.value,
                  })
                }
                isInvalid={!!errors.original_status}
              >
                <option value="">Оберіть статус</option>
                {originalStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.original_status}
              </Form.Control.Feedback>
            </div>
          </Form.Group>
          <Form.Group className="mb-3  block-name-book">
            <Form.Label className="name-book-label">Країна твору</Form.Label>
            <div className="container-name-book">
              <Form.Select
                className="input-name-book"
                value={formData.original_status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    original_status: e.target.value,
                  })
                }
                isInvalid={!!errors.original_status}
              >
                <option value="">Оберіть статус</option>
                {originalStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.original_status}
              </Form.Control.Feedback>
            </div>
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
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              isInvalid={!!errors.description}
            />
            <Form.Text className="text-muted">
              {/* {formData.description
                ? `${formData.description.split(" ").length}/250 слів`
                : "0/250 слів"} */}
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              {errors.description}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3 all-content">
            <Form.Check
              type="checkbox"
              id="adult_content"
              className={`adult-content-checkbox check-content ${styles.chapterCheck}`}
              label="Контент"
              checked={formData.adult_content}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setFormData({
                  ...formData,
                  adult_content: isChecked,
                  tags: isChecked
                    ? [...new Set([...formData.tags, adultTagId])]
                    : formData.tags.filter((id) => id !== adultTagId),
                });
              }}
            />
            <img src={Content} />
          </Form.Group>
        </div>
      </div>

      <div className="header-book-genres">
        <img src={BorderCreate} />
      </div>
      <Form.Group className="mb-3  block-name-book">
        <Form.Label
          style={{ marginTop: "-37px", padding: "5px 50px" }}
          className="name-book-label"
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
              onClick={() => {
                const newGenres = formData.genres.includes(genre.id)
                  ? formData.genres.filter((id) => id !== genre.id)
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
      <div className="tags-all">
        <Form.Group className="mb-3  block-name-book">
          <Form.Label
            style={{ marginTop: "-37px", padding: "5px 50px" }}
            className="name-book-label"
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
                    onClick={() => {
                      const newTags = formData.tags.includes(tag.id)
                        ? formData.tags.filter((id) => id !== tag.id)
                        : [...formData.tags, tag.id];

                      // Если выбран/снят тег 18+
                      if (tag.id === adultTagId) {
                        setFormData({
                          ...formData,
                          tags: newTags,
                          adult_content: !formData.tags.includes(tag.id),
                        });
                      } else {
                        setFormData({ ...formData, tags: newTags });
                      }
                    }}
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
                    onClick={() => {
                      const newTags = formData.tags.includes(tag.id)
                        ? formData.tags.filter((id) => id !== tag.id)
                        : [...formData.tags, tag.id];

                      // Если выбран/снят тег 18+
                      if (tag.id === adultTagId) {
                        setFormData({
                          ...formData,
                          tags: newTags,
                          adult_content: !formData.tags.includes(tag.id),
                        });
                      } else {
                        setFormData({ ...formData, tags: newTags });
                      }
                    }}
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
      {/* <Form.Group className="mb-3">
        <Form.Label>Країна *</Form.Label>
        <div className="countries-container">
          {countries?.map((country) => (
            <div
              key={country.id}
              className={`country-item ${
                formData.country === country.id ? "selected" : ""
              }`}
              onClick={() => setFormData({ ...formData, country: country.id })}
            >
              {country.name}
            </div>
          ))}
        </div>
        {errors.country && (
          <div className="text-danger mt-1">{errors.country}</div>
        )}
      </Form.Group> */}

      <Form.Group className="mb-3 block-name-book">
        <Form.Label style={{ top: "55px" }} className="name-book-label">
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
                formData.fandoms === fandom.id ? "selected" : ""
              }`}
              onClick={() => setFormData({ ...formData, fandoms: fandom.id })}
            >
              {fandom.name}
            </div>
          ))}
        </div>
      </Form.Group>

      {/* <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          id="adult_content"
          label="Контент 18+"
          checked={formData.adult_content}
          onChange={(e) => {
            const isChecked = e.target.checked;
            setFormData({
              ...formData,
              adult_content: isChecked,
              tags: isChecked
                ? [...new Set([...formData.tags, adultTagId])]
                : formData.tags.filter((id) => id !== adultTagId),
            });
          }}
        />
      </Form.Group> */}

      {/* {formData.book_type === "TRANSLATION" && (
        <Form.Group className="mb-3">
          <Form.Label>Статус перекладу</Form.Label>
          <Form.Control
            plaintext
            readOnly
            value="Перекладається"
            className="form-control-plaintext"
          />
        </Form.Group>
      )} */}
      <div className="all-img">
        <div className="img-book">
          <div className="general-img block-name-book">
            <Form.Group
              style={{ height: "390px", width: "288px", padding: "30px" }}
              className="mb-3 input-name-book"
            >
              <Form.Label
                style={{ top: "-38px", left: "-4px" }}
                className="name-book-label"
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
                <label htmlFor="fileInput" className="file-label input-img">
                  <div className="circle_upload">
                    <img src={Upload} alt="Загрузить" className="upload-icon" />
                    <span>Вибрати зображення</span>
                  </div>
                </label>
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="img-fluid mt-2"
                />
              )}
            </Form.Group>
          </div>
        </div>
        <div className="another_img">
          <div className="img-book">
            <div className="general-img block-name-book">
              <Form.Group
                style={{ height: "284px", width: "auto", padding: "30px" }}
                className="mb-3 input-name-book another-input-name-book"
              >
                <Form.Label
                  style={{ top: "-38px", left: "-4px" }}
                  className="name-book-label"
                >
               Додаткові зображення
                </Form.Label>

                <div className="custom-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="fileInput"
                    className="hidden-input "
                  />
                  <label htmlFor="fileInput" className="file-label input-img">
                  
                      <img
                        src={Upload}
                        alt="Загрузить"
                        className="upload-icon"
                      />
              
          
                  </label>
                </div>
                <div className="custom-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="fileInput"
                    className="hidden-input "
                  />
                  <label htmlFor="fileInput" className="file-label input-img">
                  
                      <img
                        src={Upload}
                        alt="Загрузить"
                        className="upload-icon"
                      />
              
          
                  </label>
                </div>
                <div className="custom-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="fileInput"
                    className="hidden-input "
                  />
                  <label htmlFor="fileInput" className="file-label input-img">
                  
                      <img
                        src={Upload}
                        alt="Загрузить"
                        className="upload-icon"
                      />
              
          
                  </label>
                </div>
                <div className="custom-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="fileInput"
                    className="hidden-input "
                  />
                  <label htmlFor="fileInput" className="file-label input-img">
                  
                      <img
                        src={Upload}
                        alt="Загрузить"
                        className="upload-icon"
                      />
              
          
                  </label>
                </div>
                <div className="custom-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="fileInput"
                    className="hidden-input "
                  />
                  <label htmlFor="fileInput" className="file-label input-img">
                  
                      <img
                        src={Upload}
                        alt="Загрузить"
                        className="upload-icon"
                      />
               
                  </label>
                </div>
                <div className="custom-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="fileInput"
                    className="hidden-input "
                  />
                  <label htmlFor="fileInput" className="file-label input-img">
                  
                      <img
                        src={Upload}
                        alt="Загрузить"
                        className="upload-icon"
                      />
                
                  </label>
                </div>
                <div className="custom-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="fileInput"
                    className="hidden-input "
                  />
                  <label htmlFor="fileInput" className="file-label input-img">
                 
                      <img
                        src={Upload}
                        alt="Загрузить"
                        className="upload-icon"
                      />
                   
                  </label>
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="img-fluid mt-2"
                  />
                )}
              </Form.Group>
            </div>
          </div>
          <div className="all-sub-img">
            <div className="one-sub-img"></div>
            <button className="save-book">
              <img className="top-button" src={BorderCreate} />
              <span>Опублікувати переклад</span>
              <img className="bottom-button" src={BorderCreate} />
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CreateBook;
