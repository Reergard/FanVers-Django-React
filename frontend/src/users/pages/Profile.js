import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button, Spinner, Alert, Form } from 'react-bootstrap';
import "../css/Profile.css";
import { usersAPI } from '../../api';
import { toast } from 'react-toastify';
import ModalDepositBalance from '../components/ModalDepositBalance';
import ModalWithdrawBalance from '../components/ModalWithdrawBalance';
import ModalTransactionHistory from '../components/ModalTransactionHistory';
import { setHideAdultContent } from '../../settings/userSettingsSlice';
import ModalAdultContent from '../components/ModalAdultContent';
import { monitoringAPI } from '../../api/monitoring/monitoringAPI';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Profile = () => { 
    const dispatch = useDispatch();
    const hideAdultContent = useSelector(state => state.userSettings.hideAdultContent);
    const [showAdultContentModal, setShowAdultContentModal] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [balanceHistory, setBalanceHistory] = useState([]);
    const [showTransactionHistory, setShowTransactionHistory] = useState(false);
    const [readingStats, setReadingStats] = useState(null);

    const queryClient = useQueryClient();

    const { data: readingStatsData, refetch: refetchStats } = useQuery({
        queryKey: ['readingStats'],
        queryFn: () => monitoringAPI.getUserReadingStats()
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
            const errorMessage = error.response?.data?.error || 'Помилка при завантаженні профілю';
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
        queryClient.invalidateQueries(['readingStats']);
    }, [queryClient]);

    const handleDeposit = async () => {
        try {
            setLoading(true);
            const response = await usersAPI.depositBalance(Number(amount));
            setProfile(prev => ({
                ...prev,
                balance: response.new_balance
            }));
            if (response.balance_history) {
                setBalanceHistory(response.balance_history);
            }
            toast.success('Баланс успішно поповнено');
            setShowDepositModal(false);
            setAmount('');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Помилка при поповненні балансу';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        try {
            setLoading(true);
            const response = await usersAPI.withdrawBalance(Number(amount));
            setProfile(prev => ({
                ...prev,
                balance: response.new_balance
            }));
            if (response.balance_history) {
                setBalanceHistory(response.balance_history);
            }
            toast.success('Кошти успішно виведені');
            setShowWithdrawModal(false);
            setAmount('');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Помилка при виведенні коштів';
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

    return (
        <section className="profile-section">
            <Container>
                <Container className="profile-container">
                    {error && <Alert variant="danger">{error}</Alert>}
                    {loading && !profile && <Spinner animation="border" />}
                    {profile && (
                        <div className="profile-content">
                            <div className="profile-header">
                                <h2>{profile.username}</h2>
                                <p className="role">{profile.role}</p>
                            </div>

                            <div className="profile-info">
                                <div className="info-item">
                                    <span className="label">Email:</span>
                                    <span className="value">{profile.email}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Баланс:</span>
                                    <span className="value">{profile.balance} грн</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Комісія:</span>
                                    <span className="value">{profile.commission}%</span>
                                </div>
                                <div className="info-item">
                                    <Form.Check 
                                        type="checkbox"
                                        id="hide-adult-content"
                                        label="Приховати всі книги 18+"
                                        checked={hideAdultContent}
                                        onChange={handleAdultContentChange}
                                        className="adult-content-checkbox"
                                    />
                                </div>
                            </div>

                            <div className="profile-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Кількість викладених символів:</span>
                                    <span className="stat-value">{profile.total_characters}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Загальна кількість розділів:</span>
                                    <span className="stat-value">{profile.total_chapters}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Кількість безкоштовних розділів:</span>
                                    <span className="stat-value">{profile.free_chapters}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Кількість авторських книжок:</span>
                                    <span className="stat-value">{profile.total_author}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Дата реєстрації:</span>
                                    <span className="stat-value">
                                        {new Date(profile.created).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Кількість перекладів:</span>
                                    <span className="stat-value">{profile.total_translations}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Прочитано книг:</span>
                                    <span className="stat-value">{readingStats?.completed_books || 0}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Прочитано глав:</span>
                                    <span className="stat-value">{profile.read_chapters}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Куплено глав:</span>
                                    <span className="stat-value">{profile.purchased_chapters}</span>
                                </div>
                            </div>

                            {profile.is_owner && (
                                <>
                                    <div className="balance-controls">
                                        <Button 
                                            onClick={() => setShowDepositModal(true)}
                                            variant="success"
                                            className="me-2"
                                            disabled={loading}
                                        >
                                            {loading ? 'Завантаження...' : 'Поповнити баланс'}
                                        </Button>
                                        <Button 
                                            onClick={() => setShowWithdrawModal(true)}
                                            variant="primary"
                                            className="me-2"
                                            disabled={loading || profile.balance <= 0}
                                        >
                                            {loading ? 'Завантаження...' : 'Вивести кошти'}
                                        </Button>
                                        <Button
                                            onClick={() => setShowTransactionHistory(true)}
                                            variant="info"
                                            disabled={loading}
                                        >
                                            Історія транзакцій
                                        </Button>
                                    </div>
                                </>
                            )}
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

            {readingStats && (
                <div className="reading-stats">
                    <h3>Статистика читання</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Прочитано книг:</span>
                            <span className="stat-value">{readingStats.completed_books}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Прочитано глав:</span>
                            <span className="stat-value">{readingStats.read_chapters}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Куплено глав:</span>
                            <span className="stat-value">{readingStats.purchased_chapters}</span>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Profile;
