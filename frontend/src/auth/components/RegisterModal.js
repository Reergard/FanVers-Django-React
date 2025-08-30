import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../components/CustomToast';
import { register, reset } from '../../auth/authSlice';
import '../../auth/styles/AuthModal.css';

const RegisterModal = ({ isOpen, onRequestClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const { success, error: showError } = useToast();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (formData.password !== formData.password2) {
      showError("Паролі не співпадають");
      return;
    }

    try {
      const result = await dispatch(register(formData)).unwrap();
      if (result) {
        success("Вітаємо! Для завершення реєстрації перейдіть за посиланням у листі.");
        onRequestClose();
        setFormData({ username: '', email: '', password: '', password2: '' });
      }
    } catch (err) {
      e.preventDefault();
      if (err && typeof err === 'string') {
        showError(err);
      } else if (err && err.message) {
        showError(err.message);
      } else {
        showError("Помилка реєстрації");
      }
      return false;
    }
    return false;
  };

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFormData({ username: '', email: '', password: '', password2: '' });
    dispatch(reset());
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="auth-modal"
      overlayClassName="auth-modal__overlay"
      ariaHideApp={false}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <div className="auth-modal__container">
        <h2 className="auth-modal__title">Реєстрація</h2>
        <form className="auth-modal__form" onSubmit={handleSubmit}>
          <div className="auth-modal__input-group">
            <input
              type="text"
              className="auth-modal__input"
              placeholder="Ім\'я користувача"
              name="username"
              onChange={handleChange}
              value={formData.username}
              required
            />
          </div>
          <div className="auth-modal__input-group">
            <input
              type="email"
              className="auth-modal__input"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              value={formData.email}
              required
            />
          </div>
          <div className="auth-modal__input-group">
            <input
              type="password"
              className="auth-modal__input"
              placeholder="Пароль"
              name="password"
              onChange={handleChange}
              value={formData.password}
              required
            />
          </div>
          <div className="auth-modal__input-group">
            <input
              type="password"
              className="auth-modal__input"
              placeholder="Підтвердіть пароль"
              name="password2"
              onChange={handleChange}
              value={formData.password2}
              required
            />
          </div>
          <button
            className="auth-modal__submit"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Завантаження...' : 'Зареєструватися'}
          </button>
        </form>
        <button className="auth-modal__close" onClick={handleClose}>
          ✕
        </button>
      </div>
    </Modal>
  );
};

export default RegisterModal;