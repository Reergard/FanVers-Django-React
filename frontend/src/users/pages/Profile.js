import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from 'react-bootstrap';
import "../css/Profile.css";
import { usersAPI } from '../../api';

const Profile = () => {
    const [desiredAmount, setDesiredAmount] = useState('');
    const [calculatedAmount, setCalculatedAmount] = useState(0);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await usersAPI.getProfile();
            setProfile(data);
            setError(null);
        } catch (error) {
            setError('Помилка завантаження профілю');
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (value >= 0) {
            setDesiredAmount(value);
            setCalculatedAmount(value * 10);
        }
    };

    const handlePurchase = async () => {
        if (!desiredAmount || desiredAmount <= 0) {
            setError('Будь ласка, введіть коректну кількість розділів');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await usersAPI.updateBalance(parseInt(desiredAmount));
            
            if (response.new_balance !== undefined) {
                setProfile(prev => ({
                    ...prev,
                    balance: response.new_balance
                }));
                setDesiredAmount('');
                setCalculatedAmount(0);
            }
        } catch (error) {
            console.error('Error updating balance:', error);
            setError(error.response?.data?.message || 'Помилка при поповненні балансу. Спробуйте пізніше.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile) return <p>Завантаження...</p>;

    return (
        <section>
            <Container fluid className="catalog-section" id="catalog">
                <Container className="catalog-content">
                    <div>
                        <h1>Профіль</h1>
                        {profile && (
                            <>
                                <p>Доступні розділи: {profile.balance}</p>
                                <div className="balance-form">
                                    <label>
                                        Бажана кількість розділів:
                                        <input
                                            type="number"
                                            value={desiredAmount}
                                            onChange={handleAmountChange}
                                            min="1"
                                            disabled={loading}
                                        />
                                    </label>
                                    <div className="amount-display">
                                        <p>Сума до сплати: {calculatedAmount} грн</p>
                                    </div>
                                    <button 
                                        onClick={handlePurchase}
                                        disabled={loading || !desiredAmount}
                                    >
                                        {loading ? 'Обробка...' : 'Купити'}
                                    </button>
                                </div>
                            </>
                        )}
                        {error && <p className="error-message">{error}</p>}
                    </div>
                </Container>
            </Container>
        </section>
    );
};

export default Profile;
