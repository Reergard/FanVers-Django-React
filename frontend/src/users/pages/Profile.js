import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Button, Spinner, Alert, Form } from "react-bootstrap";
import "../css/Profile.css";
import { usersAPI } from "../../api";
import Hamster from "../../main/pages/img/hamster.webp";
import openEyeIcon from "../../main/pages/img/open-eye.png"; // Обычный глаз
import closedEyeIcon from "../../main/pages/img/closed-eye.png";
import { toast } from "react-toastify";
import LoginPhoto from "../../main/pages/img/login.png";
import Save from "../../main/pages/img/save.png";
import ModalDepositBalance from "../components/ModalDepositBalance";
import ModalWithdrawBalance from "../components/ModalWithdrawBalance";
import ModalTransactionHistory from "../components/ModalTransactionHistory";
import { setHideAdultContent } from "../../settings/userSettingsSlice";
import ModalAdultContent from "../components/ModalAdultContent";
import { monitoringAPI } from "../../api/monitoring/monitoringAPI";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BreadCrumb } from "../../main/components/BreadCrumb";
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

  const queryClient = useQueryClient();

  const { data: readingStatsData, refetch: refetchStats } = useQuery({
    queryKey: ["readingStats"],
    queryFn: () => monitoringAPI.getUserReadingStats(),
  });

  useEffect(() => {
    if (readingStatsData) {
      setReadingStats(readingStatsData);
    }
  }, [readingStatsData]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersAPI.getProfile();
      setProfile(data);
      if (data.is_owner) {
        setBalanceHistory(data.balance_history || []);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Помилка при завантаженні профілю";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  const handleConfirmAdultContent = () => {
    dispatch(setHideAdultContent(true));
    setShowAdultContentModal(false);
  };
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const togglePassword = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };
  return (
    <section className="profile-section">
      <Container>
        <BreadCrumb
          items={[
            { href: "/", label: "Головна" },
            { href: "/profile", label: "Профiль" },
          ]}
        />
        <Container className="profile-container" style={{ margin: "0 auto" }}>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading && !profile && <Spinner animation="border" />}
          {profile && (
            <div className="profile-content">
              <div className="profile-header">
                <div className="login-block-name">
                  <img src={LoginPhoto} />
                  <span>Логін:</span>
                </div>
                <h2>{profile.username}</h2>
                {/* <p className="role">{profile.role}</p> */}
              </div>
              <div className="about">
                <div className="photo-profile">
                  <img src={Hamster} />
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
                      <div className="general-text">{profile.role}</div>
                      <div className="create-text">Стати перекладачем </div>
                    </div>
                  </div>
                  <div className="one-block-info">
                    <span>Загальна кількість перекладених символів:</span>
                    <div className="text-info">
                      <div className="general-text">
                        {profile.total_chapters}
                      </div>
                    </div>
                  </div>
                  <div className="one-block-info">
                    <span>Загальна кількість розділів:</span>
                    <div className="text-info">
                      <div className="general-text">
                        {profile.total_chapters}
                      </div>
                    </div>
                  </div>
                  <div className="one-block-info">
                    <span>Загальна кількість безкоштовних розділів:</span>
                    <div className="text-info">
                      <div className="general-text">
                        {profile.free_chapters}
                      </div>
                    </div>
                  </div>
                  <div className="one-block-info">
                    <span>Середній рейтинг перекладів:</span>
                    <div className="text-info">
                      <div className="general-text">
                        {profile.free_chapters}
                      </div>
                    </div>
                  </div>
                  <div className="one-block-info">
                    <span>Кількість авторських книжок:</span>
                    <div className="text-info">
                      <div className="general-text">{profile.total_author}</div>
                    </div>
                  </div>
                  <div className="one-block-info">
                    <span>Кількість перекладів:</span>
                    <div className="text-info">
                      <div className="general-text">
                        {profile.total_translations}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="block-balance">
                <div className="left-buttons-balance">
                  <button>Змінити фото профілю</button>
                  <button>Історія транзакцій</button>
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
                      placeholder="15989745421@gmail.com"
                      type="email"
                      className="new-email-input"
                    ></input>
                    <Button className="save-email">
                      <img src={Save} />
                      <span>Зберегти</span>
                    </Button>
                  </Form>
                </div>
                <div className="block-account">
                  <div className="title-email">Налаштування акаунту</div>
                  <div className="all-settings">
                    <Form.Check
                      type="checkbox"
                      id="hide-adult-content"
                      label="Сповіщення"
                      // checked={hideAdultContent}
                      // onChange={handleAdultContentChange}
                      className="adult-content-checkbox"
                    />
                    <Form.Check
                      type="checkbox"
                      id="hide-adult-content"
                      label="Прибрати 18+"
                      // checked={hideAdultContent}
                      // onChange={handleAdultContentChange}
                      className="adult-content-checkbox"
                    />
                    <Form.Check
                      type="checkbox"
                      id="hide-adult-content"
                      label="Отримувати приватні повідомлення"
                      // checked={hideAdultContent}
                      // onChange={handleAdultContentChange}
                      className="adult-content-checkbox"
                    />
                    <Form.Check
                      type="checkbox"
                      id="hide-adult-content"
                      label="Я підтверджую, що мені виповнилося 18 років, і я можу переглядати контент, призначений для дорослих."
                      // checked={hideAdultContent}
                      // onChange={handleAdultContentChange}
                      className="adult-content-checkbox"
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
                        value="15989745421"
                        className="new-email-input"
                        readOnly
                      />
                       <button
                          type="button"
                          style={{top: "60%"}}
                          className="toggle-password"
                          onClick={() => togglePassword("oldPassword")}
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
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => togglePassword("newPassword")}
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
                      <label>Підтвердити пароль</label>
                      <div className="password-wrapper">
                        <input
                          type={
                            showPasswords.confirmPassword ? "text" : "password"
                          }
                          className="new-email-input"
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => togglePassword("confirmPassword")}
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

                    <Button className="save-pass">
                      <span>Зберегти</span>
                    </Button>
                  </Form>
                </div>
                <div className="block-account">
                  <div className="title-email">Налаштування сповіщень</div>
                  <div className="all-settings">
                    <Form.Check
                      type="checkbox"
                      id="hide-adult-content"
                      label="Коментарі у ваших постах та відповіді на ваші коментарі"
                      // checked={hideAdultContent}
                      // onChange={handleAdultContentChange}
                      className="adult-content-checkbox"
                    />
                    <Form.Check
                      type="checkbox"
                      id="hide-adult-content"
                      label="Зміна статусу перекладу"
                      // checked={hideAdultContent}
                      // onChange={handleAdultContentChange}
                      className="adult-content-checkbox"
                    />
                    <Form.Check
                      type="checkbox"
                      id="hide-adult-content"
                      label="Зняття розділу з передплати"
                      // checked={hideAdultContent}
                      // onChange={handleAdultContentChange}
                      className="adult-content-checkbox"
                    />
                    <Form.Check
                      type="checkbox"
                      id="hide-adult-content"
                      label="Коментарі до розділу"
                      // checked={hideAdultContent}
                      // onChange={handleAdultContentChange}
                      className="adult-content-checkbox"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </Container>
      </Container>

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
