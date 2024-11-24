import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { register, reset } from '../authSlice';
import { useNavigate } from 'react-router-dom';

const RegisterModal = ({ isOpen, onRequestClose }) => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        re_password: "",
    });

    const { username, email, password, re_password } = formData;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password !== re_password) {
            toast.error("Паролі не співпадають");
            return;
        }

        const userData = {
            username,
            email,
            password,
            re_password
        };

        dispatch(register(userData))
            .unwrap()
            .then(() => {
                toast.success("Вітаємо! Для завершення реєстрації перейдіть за посиланням у листі.");
                onRequestClose();
            })
            .catch((error) => {
                if (typeof error === 'object') {
                    Object.values(error).forEach((err) => {
                        toast.error(err);
                    });
                } else {
                    toast.error(error);
                }
            });
    };

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess || user) {
            navigate("/");
            toast.success("Вітаємо вас на нашому сайті. Для завершення реєстрації перейдіть за посиланням, яке надіслано на вашу електронну пошту.");
            onRequestClose();
        }
        dispatch(reset());
    }, [isError, isSuccess, user, navigate, dispatch, message, onRequestClose]);

    return (
        <Modal 
            isOpen={isOpen} 
            onRequestClose={onRequestClose} 
            ariaHideApp={false}
            className="modal"
            overlayClassName="modal-overlay"
        >
            <div className="container auth__container">
                <h1 className="main__title">Register</h1>
                <form className="auth__form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        name="username"
                        onChange={handleChange}
                        value={username}
                        required
                        className="auth__input"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        onChange={handleChange}
                        value={email}
                        required
                        className="auth__input"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        onChange={handleChange}
                        value={password}
                        required
                        className="auth__input"
                    />
                    <input
                        type="password"
                        placeholder="Retype Password"
                        name="re_password"
                        onChange={handleChange}
                        value={re_password}
                        required
                        className="auth__input"
                    />
                    <button 
                        className="btn btn-primary" 
                        type="submit" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Register'}
                    </button>
                </form>
                <button 
                    onClick={onRequestClose}
                    className="btn btn-secondary"
                >
                    Закрити
                </button>
            </div>
        </Modal>
    );
};

export default RegisterModal;