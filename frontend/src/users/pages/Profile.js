import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Button, Spinner, Alert, Form } from "react-bootstrap";
import "../css/Profile.css";
import { usersAPI } from "../../api";
import { ProfileImage } from '../../main/components/Header/ProfileImage';
import { FALLBACK_IMAGES, IMAGE_SIZES } from "../../constants/fallbackImages";
import openEyeIcon from '../../main/pages/img/open-eye.png';
import closedEyeIcon from '../../main/pages/img/closed-eye.png';
import { toast } from "react-toastify";
import LoginPhoto from '../../main/pages/img/login.png';
import Save from '../../main/pages/img/save.png';
import ModalDepositBalance from "../components/ModalDepositBalance";
import ModalWithdrawBalance from "../components/ModalWithdrawBalance";
import ModalTransactionHistory from "../components/ModalTransactionHistory";
import { setHideAdultContent } from "../../settings/userSettingsSlice";
import ModalAdultContent from "../components/ModalAdultContent";
import { monitoringAPI } from '../../api/monitoring/monitoringAPI';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BreadCrumb } from '../../main/components/BreadCrumb';
import { getProfile } from "../../auth/authSlice";
import { withVersion } from "../../utils/withVersion";
import { useRef } from "react";

const Profile = () => {
  const dispatch = useDispatch();
  const hideAdultContent = useSelector(
    (state) => state.userSettings.hideAdultContent
  );
  const [showAdultContentModal, setShowAdultContentModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [readingStats, setReadingStats] = useState(null);

  // State для завантаження аватара
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const [avatarVersion, setAvatarVersion] = useState(0); // 0 = немає завантажень, >0 = версія для кеш-бастингу

  // Ref для file input
  const fileRef = useRef(null);

  // Нові state для email та пароля
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  // State для налаштувань сповіщень
  const [notificationSettings, setNotificationSettings] = useState({
    notifications_enabled: true,
    hide_adult_content: false,
    private_messages_enabled: true,
    age_confirmed: false,
    comment_notifications: true,
    translation_status_notifications: true,
    chapter_subscription_notifications: true,
    chapter_comment_notifications: true
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [roleChanging, setRoleChanging] = useState(false);

  const queryClient = useQueryClient();

  const { data: readingStatsData, refetch: refetchStats } = useQuery({
    queryKey: ["readingStats"],
    queryFn: () => monitoringAPI.getUserReadingStats(),
  });

  // Отримуємо профіль з Redux store
  const reduxProfile = useSelector((state) => state.auth.profile);

  useEffect(() => {
    if (readingStatsData) {
      setReadingStats(readingStatsData);
    }
  }, [readingStatsData]);

  // Синхронізуємо локальний state з Redux store
  useEffect(() => {
    if (reduxProfile && reduxProfile.role && (!profile || profile.role !== reduxProfile.role)) {
      console.log('🔄 Синхронізую роль з Redux:', reduxProfile.role, '->', profile?.role || 'Н/Д');
      
      if (!profile) {
        // Якщо локальний профіль порожній, встановлюємо Redux профіль
        console.log('🔄 Встановлюю новий профіль з Redux:', reduxProfile.role);
        setProfile(reduxProfile);
      } else {
        // Інакше оновлюємо тільки роль
        console.log('🔄 Оновлюю роль в існуючому профілі:', profile.role, '->', reduxProfile.role);
        setProfile(prev => ({
          ...prev,
          role: reduxProfile.role
        }));
        
        // Показуємо повідомлення про оновлення ролі
        toast.info(`Роль оновлено: ${profile.role} → ${reduxProfile.role}`);
      }
    }
  }, [reduxProfile, profile]);

  // Оновлюємо профіль при фокусі на сторінці (наприклад, після повернення з адмінки)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🎯 Сторінка отримала фокус, оновлюю профіль...');
      dispatch(getProfile());
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch]);

  // Автоматично оновлюємо профіль кожні 30 секунд для синхронізації з адмінкою
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Автоматичне оновлення профілю...');
      dispatch(getProfile());
    }, 30000); // 30 секунд

    return () => clearInterval(interval);
  }, [dispatch]);

  // Додаткова перевірка при зміні Redux профілю
  useEffect(() => {
    if (reduxProfile && reduxProfile.role && profile && profile.role !== reduxProfile.role) {
      console.log('🔄 Redux профіль змінився, оновлюю локальний:', profile.role, '->', reduxProfile.role);
      setProfile(prev => ({
        ...prev,
        role: reduxProfile.role
      }));
      
      // Показуємо повідомлення про оновлення ролі
      toast.info(`Роль оновлено: ${profile.role} → ${reduxProfile.role}`);
    }
  }, [reduxProfile?.role, profile?.role]);

  // Примусове оновлення профілю при зміні ролі через адмінку
  useEffect(() => {
    if (reduxProfile && reduxProfile.role && profile && profile.role !== reduxProfile.role) {
      console.log('🔄 Примусове оновлення ролі з адмінки:', profile.role, '->', reduxProfile.role);
      
      // Оновлюємо роль в локальному state
      setProfile(prev => ({
        ...prev,
        role: reduxProfile.role
      }));
      
      // Показуємо повідомлення
      toast.info(`Роль оновлено з адмінки: ${profile.role} → ${reduxProfile.role}`);
    }
  }, [reduxProfile?.role]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersAPI.getProfile();
      
      // Якщо є Redux профіль з актуальною роллю, використовуємо його
      if (reduxProfile && reduxProfile.role && reduxProfile.role !== data.role) {
        console.log('🔄 Використовую роль з Redux:', reduxProfile.role, 'замість:', data.role);
        setProfile({
          ...data,
          role: reduxProfile.role
        });
      } else {
        console.log('🔍 Встановлюю профіль з API:', data.role);
        setProfile(data);
      }
      
      if (data.is_owner) {
        setBalanceHistory(data.balance_history || []);
      }
      
      // Додатково перевіряємо актуальну роль користувача
      console.log('🔍 Завантажено профіль, поточна роль:', data.role);
      
    } catch (error) {
      console.error('Profile fetch error:', error);
      
      // Обробляємо різні типи помилок
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        const errorMessage = "Помилка з\'єднання з сервером. Перевірте, чи запущений Django сервер.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (error.response?.status === 401) {
        const errorMessage = "Необхідна авторизація. Перенаправляємо на сторінку входу...";
        setError(errorMessage);
        toast.error(errorMessage);
        // Автоматично перенаправляємо на логін через 2 секунди
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        const errorMessage = error.response?.data?.error || "Помилка при завантаженні профілю";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Спочатку завантажуємо профіль через Redux
    dispatch(getProfile());
    
    // Потім завантажуємо локально для додаткової інформації
    fetchProfile();
  }, [dispatch, fetchProfile]);

  // Ініціалізація email з профілю
  useEffect(() => {
    if (profile?.email) {
      setNewEmail(profile.email);
    }
  }, [profile?.email]);

  // Ініціалізація налаштувань сповіщень з профілю
  useEffect(() => {
    if (profile) {
      setNotificationSettings({
        notifications_enabled: profile.notifications_enabled ?? true,
        hide_adult_content: profile.hide_adult_content ?? false,
        private_messages_enabled: profile.private_messages_enabled ?? true,
        age_confirmed: profile.age_confirmed ?? false,
        comment_notifications: profile.comment_notifications ?? true,
        translation_status_notifications: profile.translation_status_notifications ?? true,
        chapter_subscription_notifications: profile.chapter_subscription_notifications ?? true,
        chapter_comment_notifications: profile.chapter_comment_notifications ?? true
      });
    }
  }, [profile]);

  useEffect(() => {
    queryClient.invalidateQueries(["readingStats"]);
  }, [queryClient]);

  const handleDeposit = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.depositBalance(Number(amount));
      setProfile((prev) => ({
        ...prev,
        balance: response.new_balance,
      }));
      if (response.balance_history) {
        setBalanceHistory(response.balance_history);
      }
      toast.success("Баланс успішно поповнено");
      setShowDepositModal(false);
      setAmount("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Помилка при поповненні балансу";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.withdrawBalance(Number(amount));
      setProfile((prev) => ({
        ...prev,
        balance: response.new_balance,
      }));
      if (response.balance_history) {
        setBalanceHistory(response.balance_history);
      }
      toast.success("Кошти успішно виведені");
      setShowWithdrawModal(false);
      setAmount("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Помилка при виведенні коштів";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAdultContentChange = (e) => {
    if (e.target.checked) {
      setShowAdultContentModal(true);
    } else {
      dispatch(setHideAdultContent(false));
    }
  };

  const closeAdultContentModal = () => {
    setShowAdultContentModal(false);
  };

  const handleConfirmAdultContent = () => {
    dispatch(setHideAdultContent(true));
    setShowAdultContentModal(false);
  };

  // Функція для оновлення налаштувань сповіщень
  const handleNotificationSettingChange = async (setting, value) => {
    try {
      setSettingsLoading(true);
      
      const updatedSettings = {
        ...notificationSettings,
        [setting]: value
      };
      
      // Якщо це налаштування 18+ контенту, оновлюємо Redux
      if (setting === 'hide_adult_content') {
        dispatch(setHideAdultContent(value));
      }
      
      // Оновлюємо локальний state
      setNotificationSettings(updatedSettings);
      
      // Відправляємо на backend
      await usersAPI.updateNotificationSettings(updatedSettings);
      
      toast.success('Налаштування успішно оновлено');
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Помилка при оновленні налаштувань";
      toast.error(errorMessage);
      
      // Відкатуємо зміни при помилці
      setNotificationSettings(prev => ({
        ...prev,
        [setting]: !value
      }));
      
      if (setting === 'hide_adult_content') {
        dispatch(setHideAdultContent(!value));
      }
    } finally {
      setSettingsLoading(false);
    }
  };

  // Функції для роботи з email
  const handleEmailChange = (e) => {
    setNewEmail(e.target.value);
    setEmailError("");
    setEmailSuccess("");
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email не може бути порожнім";
    }
    if (!emailRegex.test(email)) {
      return "Невірний формат email";
    }
    return null;
  };

  const handleEmailSubmit = async () => {
    try {
      const validationError = validateEmail(newEmail);
      if (validationError) {
        setEmailError(validationError);
        return;
      }

      setEmailLoading(true);
      setEmailError("");
      setEmailSuccess("");

      const response = await usersAPI.updateEmail(newEmail);
      
      // Оновлюємо профіль з новим email
      setProfile(prev => ({
        ...prev,
        email: response.new_email
      }));
      
      setEmailSuccess("Email успішно оновлено!");
      setNewEmail("");
      
      // Очищаємо повідомлення через 3 секунди
      setTimeout(() => {
        setEmailSuccess("");
      }, 3000);

    } catch (error) {
      const errorMessage = error.response?.data?.error || "Помилка при оновленні email";
      setEmailError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setEmailLoading(false);
    }
  };

  // Функції для роботи з паролем
  const handlePasswordChange = (field, value) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const validatePasswords = () => {
    if (!passwords.oldPassword) {
      return "Введіть поточний пароль";
    }
    if (!passwords.newPassword) {
      return "Введіть новий пароль";
    }
    if (passwords.newPassword.length < 8) {
      return "Новий пароль повинен містити мінімум 8 символів";
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return "Новий пароль та підтвердження не співпадають";
    }
    return null;
  };

  const handlePasswordSubmit = async () => {
    try {
      const validationError = validatePasswords();
      if (validationError) {
        setPasswordError(validationError);
        return;
      }

      setPasswordLoading(true);
      setPasswordError("");
      setPasswordSuccess("");

      await usersAPI.changePassword(
        passwords.oldPassword,
        passwords.newPassword,
        passwords.confirmPassword
      );
      
      setPasswordSuccess("Пароль успішно змінено!");
      
      // Очищаємо поля паролів
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Очищаємо повідомлення через 3 секунди
      setTimeout(() => {
        setPasswordSuccess("");
      }, 3000);

    } catch (error) {
      const errorMessage = error.response?.data?.error || "Помилка при зміні пароля";
      setPasswordError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const togglePassword = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Функції для роботи з аватаром
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Очищаємо попередні помилки та успіхи
    setAvatarError("");
    setAvatarSuccess("");

    // Валідація файлу
    const validationError = validateAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      return;
    }

    // Створюємо preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setAvatarFile(file);
  };

  const validateAvatarFile = (file) => {
    // Перевірка розміру (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return "Розмір файлу не може перевищувати 5MB";
    }

    // Перевірка типу файлу
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return "Підтримуються тільки формати: JPEG, PNG, WebP";
    }

    return null;
  };

  const validateMagicBytes = async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // JPEG: FF D8 FF
      const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
      // PNG: 89 50 4E 47
      const isPng = bytes[0] === 0x89 && String.fromCharCode(...bytes.slice(1, 4)) === 'PNG';
      // WebP: RIFF....WEBP
      const isWebp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && 
                    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
      
      return isJpeg || isPng || isWebp;
    } catch (error) {
      console.warn("Не вдалося прочитати файл для перевірки magic bytes:", error);
      return true; // Якщо не вдалося прочитати, пропускаємо цю перевірку
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      setAvatarLoading(true);
      setAvatarError("");
      setAvatarSuccess("");

      // Додаткова перевірка magic bytes перед відправкою
      const isValidMagicBytes = await validateMagicBytes(avatarFile);
      if (!isValidMagicBytes) {
        setAvatarError("Невірний формат файлу або файл пошкоджений");
        setAvatarLoading(false);
        return;
      }

      // Оптимістичне оновлення - показуємо нове зображення одразу
      const tempImageUrl = avatarPreview;
      setProfile(prev => ({
        ...prev,
        image: tempImageUrl,
        profile_image_small: tempImageUrl,
        profile_image_large: tempImageUrl,
        has_custom_image: true
      }));

      const response = await usersAPI.uploadProfileImage(avatarFile);
      
      // Оновлюємо профіль з реальним URL з сервера
      setProfile(prev => ({
        ...prev,
        image: response.image_url,
        profile_image_small: response.image_url,
        profile_image_large: response.image_url,
        has_custom_image: true
      }));
      
      // Встановлюємо версію для кеш-бастингу
      setAvatarVersion(Date.now());
      
      // Очищаємо state
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Сбрасываем значение file input
      if (fileRef.current) fileRef.current.value = '';
      
      setAvatarSuccess("Фото профілю успішно оновлено!");
      
      // Очищаємо повідомлення через 3 секунди
      setTimeout(() => {
        setAvatarSuccess("");
      }, 3000);

      // Оновлюємо Redux state для синхронізації з іншими компонентами
      dispatch(getProfile());

      // Додатково оновлюємо Redux state для синхронізації з Header
      // Це забезпечить оновлення зображення профілю в усіх компонентах
      setTimeout(() => {
        dispatch(getProfile());
      }, 100);

    } catch (error) {
      console.error('Avatar upload error:', error);
      
      // Відкатуємо оптимістичне оновлення при помилці
      if (profile) {
        setProfile(prev => ({
          ...prev,
          image: prev.image || null,
          profile_image_small: prev.profile_image_small || null,
          profile_image_large: prev.profile_image_large || null,
          has_custom_image: prev.has_custom_image || false
        }));
      }
      
      let errorMessage = "Помилка при завантаженні фото";
      
      // Спеціальна обробка різних типів помилок
      if (error.response?.status === 429) {
        errorMessage = "Занадто багато спроб завантаження. Спробуйте через годину або зверніться до адміністратора.";
        toast.error(errorMessage);
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = "Помилка з\'єднання з сервером. Перевірте, чи запущений Django сервер.";
        toast.error(errorMessage);
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
      
      setAvatarError(errorMessage);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarCancel = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError("");
    setAvatarSuccess("");
    
    // Сбрасываем значение file input
    if (fileRef.current) fileRef.current.value = '';
  };



  // Функції для зміни ролі
  const handleBecomeTranslator = async () => {
    try {
      setRoleChanging(true);
      const response = await usersAPI.becomeTranslator();
      
      // Оновлюємо профіль з новою роллю
      setProfile(prev => ({
        ...prev,
        role: response.role
      }));
      
      toast.success(response.message);
      
      // Оновлюємо Redux state
      dispatch(getProfile());
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Помилка при зміні ролі";
      toast.error(errorMessage);
    } finally {
      setRoleChanging(false);
    }
  };

  const handleBecomeAuthor = async () => {
    try {
      setRoleChanging(true);
      const response = await usersAPI.becomeAuthor();
      
      // Оновлюємо профіль з новою роллю
      setProfile(prev => ({
        ...prev,
        role: response.role
      }));
      
      toast.success(response.message);
      
      // Оновлюємо Redux state
      dispatch(getProfile());
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Помилка при зміні ролі";
      toast.error(errorMessage);
    } finally {
      setRoleChanging(false);
    }
  };
  
  return (
    <section className="profile-section">
      <div className="container-profile-user">
        <BreadCrumb
          items={[
            { href: "/", label: "Головна" },
            { href: "/profile", label: "Профiль" },
          ]}
        />
        <div className="profile-container" style={{ margin: "0 auto" }}>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading && !profile && <Spinner animation="border" />}
          {profile && (
            <div className="profile-content">
              <div className="profile-header">
                <div className="login-block-name">
                  <img src={LoginPhoto} alt="Логін" />
                  <span>Логін:</span>
                </div>
                <h2>{profile.username}</h2>
              </div>
              <div className="about">
                <div className="photo-profile">
                  <ProfileImage
                    src={
                      (profile.profile_image_large || profile.image)
                        ? (avatarVersion
                            ? withVersion(profile.profile_image_large || profile.image, avatarVersion)
                            : (profile.profile_image_large || profile.image))
                        : null
                    }
                    alt={`Фото профілю ${profile.username}`}
                    className="profile-photo"
                    size={IMAGE_SIZES.PROFILE_PAGE}
                    fallbackLarge={FALLBACK_IMAGES.LARGE}
                    fallbackSmall={FALLBACK_IMAGES.SMALL}
                  />
                </div>
                <div className="all-info-profile">
                  <div className="one-block-info">
                    <span>Про себе:</span>
                    <div className="text-info-desc">
                      <div className="general-text">{profile.about}</div>
                      <div className="create-text">Змінити </div>
                    </div>
                  </div>
                  <div className="one-block-info">
                    <span>Тип профiлю:</span>
                    <div className="text-info">
                                             <div className="general-text">
                         {profile.role}
                       </div>
                      {profile.role === 'Читач' && (
                        <button 
                          className="create-text become-translator-btn"
                          onClick={handleBecomeTranslator}
                          disabled={roleChanging}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#007bff',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: 'inherit'
                          }}
                        >
                          {roleChanging ? "Зміна ролі..." : "Стати перекладачем"}
                        </button>
                      )}
                      {profile.role === 'Перекладач' && (
                        <button 
                          className="create-text become-author-btn"
                          onClick={handleBecomeAuthor}
                          disabled={roleChanging}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#28a745',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: 'inherit'
                          }}
                        >
                          {roleChanging ? "Зміна ролі..." : "Стати літератором"}
                        </button>
                      )}
                      {profile.role === 'Літератор' && (
                        <span className="create-text" style={{ color: '#6c757d' }}>
                          Літератор
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="one-block-info">
                    <span>Загальна кількість перекладених символів:</span>
                    <div className="text-info">
                      <div className="general-text">
                        {profile.total_characters || 0}
                      </div>
                    </div>
                  </div>
                  <div className="one-block-info">
                    <span>Загальна кількість розділів:</span>
                    <div className="text-info">
                      <div className="general-text">
                        {profile.total_chapters || 0}
                      </div>
                    </div>
                  </div>
                  <div className="one-block-info">
                    <span>Загальна кількість безкоштовних розділів:</span>
                    <div className="text-info">
                      <div className="general-text">
                        {profile.free_chapters || 0}
                      </div>
                    </div>
                  </div>
                  <div className="one-block-info">
                    <span>Середній рейтинг перекладів:</span>
                    <div className="text-info">
                      <div className="general-text">
                        {profile.average_rating || "Н/Д"}
                      </div>
                    </div>
                  </div>
                  <div className="one-block-info">
                    <span>Кількість авторських книжок:</span>
                    <div className="text-info">
                      <div className="general-text">{profile.total_author || 0}</div>
                    </div>
                  </div>
                  <div className="one-block-info">
                    <span>Кількість перекладів:</span>
                    <div className="text-info">
                      <div className="general-text">
                        {profile.total_translations || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="block-balance">
                <div className="left-buttons-balance">
                  <div className="avatar-upload-section">
                    <button 
                      type="button"
                      onClick={() => fileRef.current.click()}
                      disabled={avatarLoading}
                    >
                      {avatarLoading ? "Завантаження..." : "Змінити фото профілю"}
                    </button>
                    
                    {/* Прихований input для вибору файлу */}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                    
                    {/* Preview та кнопки управління */}
                    {avatarPreview && (
                      <div className="avatar-preview">
                        <img 
                          src={avatarPreview} 
                          alt="Preview" 
                          style={{ 
                            width: '100px', 
                            height: '100px', 
                            objectFit: 'cover',
                            borderRadius: '50%',
                            margin: '10px 0'
                          }} 
                        />
                        <div className="avatar-actions">
                          <button 
                            onClick={handleAvatarUpload}
                            disabled={avatarLoading}
                            style={{ 
                              backgroundColor: '#28a745', 
                              color: 'white',
                              border: 'none',
                              padding: '5px 15px',
                              borderRadius: '4px',
                              marginRight: '10px'
                            }}
                          >
                            {avatarLoading ? "Завантаження..." : "Зберегти"}
                          </button>
                          <button 
                            onClick={handleAvatarCancel}
                            disabled={avatarLoading}
                            style={{ 
                              backgroundColor: '#6c757d', 
                              color: 'white',
                              border: 'none',
                              padding: '5px 15px',
                              borderRadius: '4px'
                            }}
                          >
                            Скасувати
                          </button>
                        </div>
                        
                        {/* Повідомлення про помилки та успіх */}
                        {avatarError && (
                          <div style={{ color: 'red', fontSize: '14px', marginTop: '10px' }}>
                            {avatarError}
                          </div>
                        )}
                        {avatarSuccess && (
                          <div style={{ color: 'green', fontSize: '14px', marginTop: '10px' }}>
                            {avatarSuccess}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button onClick={() => setShowTransactionHistory(true)}>
                    Історія транзакцій
                  </button>
                </div>
                <div className="right-buttons-balance">
                  <div className="commission">
                    <span className="label">Комісія:</span>
                    <span className="value">{profile.commission}%</span>
                  </div>
                  <div className="balance-all">
                    <div className="balance">
                      <span className="label">Баланс:</span>
                      <span className="value">{profile.balance}</span>
                    </div>

                    {profile.is_owner && (
                      <>
                        <div className="balance-buttons">
                          <Button
                            onClick={() => setShowDepositModal(true)}
                            variant="success"
                            className="replenish"
                            disabled={loading}
                          >
                            {loading ? "Завантаження..." : "Поповнити баланс"}
                          </Button>
                          <Button
                            onClick={() => setShowWithdrawModal(true)}
                            variant="primary"
                            className="withdraw"
                            disabled={loading || profile.balance <= 0}
                          >
                            {loading ? "Завантаження..." : "Вивести кошти"}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="email-account">
                <div className="block-email">
                  <div className="title-email">Змінити email</div>
                  <Form className="new-email">
                    <label>Новий email:</label>
                    <input
                      placeholder="Введіть новий email"
                      type="email"
                      className="new-email-input"
                      value={newEmail}
                      onChange={handleEmailChange}
                      disabled={emailLoading}
                    />
                    {emailError && (
                      <div className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                        {emailError}
                      </div>
                    )}
                    {emailSuccess && (
                      <div className="success-message" style={{ color: 'green', fontSize: '14px', marginTop: '5px' }}>
                        {emailSuccess}
                      </div>
                    )}
                    <Button 
                      className="save-email"
                      onClick={handleEmailSubmit}
                      disabled={emailLoading || !newEmail.trim()}
                    >
                      {emailLoading ? (
                        <>
                          <Spinner animation="border" size="sm" />
                          <span>Збереження...</span>
                        </>
                      ) : (
                        <>
                          <img src={Save} alt="Зберегти" />
                          <span>Зберегти</span>
                        </>
                      )}
                    </Button>
                  </Form>
                </div>
                <div className="block-account">
                  <div className="title-email">Налаштування акаунту</div>
                  <div className="all-settings">
                    <Form.Check
                      type="checkbox"
                      id="notifications-account"
                      label="Сповіщення"
                      checked={notificationSettings.notifications_enabled}
                      onChange={(e) => handleNotificationSettingChange('notifications_enabled', e.target.checked)}
                      className="adult-content-checkbox"
                      disabled={settingsLoading}
                    />
                    <Form.Check
                      type="checkbox"
                      id="private-messages-account"
                      label="Отримувати приватні повідомлення"
                      checked={notificationSettings.private_messages_enabled}
                      onChange={(e) => handleNotificationSettingChange('private_messages_enabled', e.target.checked)}
                      className="adult-content-checkbox"
                      disabled={settingsLoading}
                    />
                    <Form.Check
                      type="checkbox"
                      id="confirm-age-account"
                      label="Я підтверджую, що мені виповнилося 18 років, і я можу переглядати контент, призначений для дорослих."
                      checked={notificationSettings.age_confirmed}
                      onChange={(e) => handleNotificationSettingChange('age_confirmed', e.target.checked)}
                      className="adult-content-checkbox"
                      disabled={settingsLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="pass">
                <div className="block-email">
                  <div className="title-email">Змінити пароль</div>
                  <Form className="new-email">
                    <div className="input-block">
                      <label>Старий пароль</label>
                      <input
                        type={showPasswords.oldPassword ? "text" : "password"}
                        value={passwords.oldPassword}
                        onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                        className="new-email-input"
                        placeholder="Введіть поточний пароль"
                        disabled={passwordLoading}
                      />
                       <button
                          type="button"
                          style={{top: "60%"}}
                          className="toggle-password"
                          onClick={() => togglePassword("oldPassword")}
                          disabled={passwordLoading}
                        >
                          <img
                            src={
                              showPasswords.oldPassword
                                ? openEyeIcon
                                : closedEyeIcon
                            }
                            alt="Toggle visibility"
                          />
                        </button>
                    </div>

                    <div className="input-block">
                      <label>Новий пароль</label>
                      <div className="password-wrapper">
                        <input
                          type={showPasswords.newPassword ? "text" : "password"}
                          className="new-email-input"
                          value={passwords.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          placeholder="Введіть новий пароль"
                          disabled={passwordLoading}
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => togglePassword("newPassword")}
                          disabled={passwordLoading}
                        >
                          <img
                            src={
                              showPasswords.newPassword
                                ? openEyeIcon
                                : closedEyeIcon
                            }
                            alt="Toggle visibility"
                          />
                        </button>
                      </div>
                    </div>

                    <div className="input-block">
                      <label>Підтвердження нового пароля</label>
                      <div className="password-wrapper">
                        <input
                          type={showPasswords.confirmPassword ? "text" : "password"}
                          className="new-email-input"
                          value={passwords.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          placeholder="Підтвердіть новий пароль"
                          disabled={passwordLoading}
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => togglePassword("confirmPassword")}
                          disabled={passwordLoading}
                        >
                          <img
                            src={
                              showPasswords.confirmPassword
                                ? openEyeIcon
                                : closedEyeIcon
                            }
                            alt="Toggle visibility"
                          />
                        </button>
                      </div>
                    </div>

                    {passwordError && (
                      <div className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '10px' }}>
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="success-message" style={{ color: 'green', fontSize: '14px', marginTop: '10px' }}>
                        {passwordSuccess}
                      </div>
                    )}

                    <Button 
                      className="save-email"
                      onClick={handlePasswordSubmit}
                      disabled={passwordLoading || !passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword}
                    >
                      {passwordLoading ? (
                        <>
                          <Spinner animation="border" size="sm" />
                          <span>Зміна пароля...</span>
                        </>
                      ) : (
                        <>
                          <img src={Save} alt="Зберегти" />
                          <span>Змінити пароль</span>
                        </>
                      )}
                    </Button>
                  </Form>
                </div>
                <div className="block-account">
                  <div className="title-email">Налаштування сповіщень</div>
                  <div className="all-settings">
                    <Form.Check
                      type="checkbox"
                      id="notifications"
                      label="Сповіщення"
                      checked={notificationSettings.notifications_enabled}
                      onChange={(e) => handleNotificationSettingChange('notifications_enabled', e.target.checked)}
                      className="adult-content-checkbox"
                      disabled={settingsLoading}
                    />
                    <Form.Check
                      type="checkbox"
                      id="hide-adult-content"
                      label="Прибрати 18+"
                      checked={notificationSettings.hide_adult_content}
                      onChange={(e) => handleNotificationSettingChange('hide_adult_content', e.target.checked)}
                      className="adult-content-checkbox"
                      disabled={settingsLoading}
                    />
                    <Form.Check
                      type="checkbox"
                      id="private-messages"
                      label="Отримувати приватні повідомлення"
                      checked={notificationSettings.private_messages_enabled}
                      onChange={(e) => handleNotificationSettingChange('private_messages_enabled', e.target.checked)}
                      className="adult-content-checkbox"
                      disabled={settingsLoading}
                    />
                    <Form.Check
                      type="checkbox"
                      id="confirm-age"
                      label="Я підтверджую, що мені виповнилося 18 років, і я можу переглядати контент, призначений для дорослих."
                      checked={notificationSettings.age_confirmed}
                      onChange={(e) => handleNotificationSettingChange('age_confirmed', e.target.checked)}
                      className="adult-content-checkbox"
                      disabled={settingsLoading}
                    />
                    <Form.Check
                      type="checkbox"
                      id="comments-notifications"
                      label="Коментарі у ваших постах та відповіді на ваші коментарі"
                      checked={notificationSettings.comment_notifications}
                      onChange={(e) => handleNotificationSettingChange('comment_notifications', e.target.checked)}
                      className="adult-content-checkbox"
                      disabled={settingsLoading}
                    />
                    <Form.Check
                      type="checkbox"
                      id="translation-status"
                      label="Зміна статусу перекладу"
                      checked={notificationSettings.translation_status_notifications}
                      onChange={(e) => handleNotificationSettingChange('translation_status_notifications', e.target.checked)}
                      className="adult-content-checkbox"
                      disabled={settingsLoading}
                    />
                    <Form.Check
                      type="checkbox"
                      id="chapter-subscription"
                      label="Зняття розділу з передплати"
                      checked={notificationSettings.chapter_subscription_notifications}
                      onChange={(e) => handleNotificationSettingChange('chapter_subscription_notifications', e.target.checked)}
                      className="adult-content-checkbox"
                      disabled={settingsLoading}
                    />
                    <Form.Check
                      type="checkbox"
                      id="chapter-comments"
                      label="Коментарі до розділу"
                      checked={notificationSettings.chapter_comment_notifications}
                      onChange={(e) => handleNotificationSettingChange('chapter_comment_notifications', e.target.checked)}
                      className="adult-content-checkbox"
                      disabled={settingsLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ModalDepositBalance
        show={showDepositModal}
        onHide={() => setShowDepositModal(false)}
        amount={amount}
        setAmount={setAmount}
        onSubmit={handleDeposit}
        loading={loading}
      />

      <ModalWithdrawBalance
        show={showWithdrawModal}
        onHide={() => setShowWithdrawModal(false)}
        amount={amount}
        setAmount={setAmount}
        onSubmit={handleWithdraw}
        loading={loading}
        maxAmount={profile?.balance || 0}
      />

      <ModalTransactionHistory
        show={showTransactionHistory}
        onHide={() => setShowTransactionHistory(false)}
        balanceHistory={balanceHistory}
      />

      <ModalAdultContent
        show={showAdultContentModal}
        onHide={() => setShowAdultContentModal(false)}
        onConfirm={handleConfirmAdultContent}
      />
    </section>
  );
};

export default Profile;
