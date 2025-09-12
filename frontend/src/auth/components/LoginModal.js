import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../components/CustomToast';
import { login, reset, getProfile } from '../../auth/authSlice';
import tokenService from '../../auth/tokenService';
import '../../auth/styles/AuthModal.css';

const LoginModal = ({ isOpen, onRequestClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
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
    
    if (!formData.username || !formData.password) {
      showError("Будь ласка, заповніть всі поля");
      return;
    }

    try {
      const result = await dispatch(login(formData)).unwrap();
      if (result) {
        // Сначала загружаем профиль, мониторинг запустится автоматически в App.js
        await dispatch(getProfile()).unwrap();
        success("Ви успішно увійшли в систему");
        onRequestClose();
        setFormData({ username: '', password: '' });
      }
    } catch (error) {
      if (error && typeof error === 'string') {
        if (error.toLowerCase().includes('no active account') || 
          error.toLowerCase().includes('credentials')) {
          showError("Невірний логін або пароль");
        } else {
          showError(error);
        }
      } else {
        showError("Помилка входу в систему");
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
    setFormData({ username: '', password: '' });
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
        <h2 className="auth-modal__title">Вхід</h2>
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
              type="password"
              className="auth-modal__input"
              placeholder="Пароль"
              name="password"
              onChange={handleChange}
              value={formData.password}
              required
            />
          </div>
          <button
            className="auth-modal__submit"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Завантаження...' : 'Увійти'}
          </button>
        </form>
        <button className="auth-modal__close" onClick={handleClose}>
          ✕
        </button>
      </div>
    </Modal>
  );
};

export default LoginModal;
