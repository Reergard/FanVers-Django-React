import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from 'react-bootstrap';
import "../css/Profile.css";
import { usersAPI } from '../../api';

const Profile = () => {
    const dispatch = useDispatch();
    const { userInfo, isLoading, isError } = useSelector((state) => state.auth);
    const [desiredAmount, setDesiredAmount] = useState('');
    const [calculatedAmount, setCalculatedAmount] = useState(0);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await usersAPI.getProfile();
            setProfile(data);
        } catch (error) {
            setError('Помилка завантаження профілю');
        }
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        setDesiredAmount(value);
        setCalculatedAmount(value * 10);
    };

    const handlePurchase = async () => {
        try {
            await usersAPI.updateProfile({ amount: parseInt(desiredAmount) });
            setDesiredAmount('');
            setCalculatedAmount(0);
            fetchProfile();
        } catch (error) {
            setError('Помилка при поповненні балансу');
        }
    };

    if (isLoading) return <p>Загрузка...</p>;
    if (isError) return <p>Ошибка загрузки профиля</p>;

    return (
        <section>
            <Container fluid className="catalog-section" id="catalog">
                <Container className="catalog-content">
                    <div>
                        <h1>Профіль</h1>
                        {profile && (
                            <>
                                <p>Доступні розділи: {profile.balance}</p>
                                <div>
                                    <label>Бажана кількість розділів:</label>
                                    <input
                                        type="number"
                                        value={desiredAmount}
                                        onChange={handleAmountChange}
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <p>Сума до сплати: {calculatedAmount} грн</p>
                                </div>
                                <button onClick={handlePurchase}>Купити</button>
                            </>
                        )}
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                    </div>
                </Container>
            </Container>
        </section>
    );
};

export default Profile;
