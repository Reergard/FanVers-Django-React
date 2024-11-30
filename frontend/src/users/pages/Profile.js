import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Modal, Button, Form } from 'react-bootstrap';
import "../css/Profile.css";
import { usersAPI } from '../../api';
import { toast } from 'react-toastify';
import ModalDepositBalance from '../components/ModalDepositBalance';
import ModalWithdrawBalance from '../components/ModalWithdrawBalance';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await usersAPI.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async () => {
        try {
            setLoading(true);
            const response = await usersAPI.depositBalance(Number(amount));
            setProfile(prev => ({
                ...prev,
                balance: response.new_balance
            }));
            toast.success('Баланс успішно поповнено');
            setShowDepositModal(false);
            setAmount('');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Помилка при поповненні балансу');
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
            toast.success('Кошти успішно виведені');
            setShowWithdrawModal(false);
            setAmount('');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Помилка при виведенні коштів');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <Container fluid className="catalog-section" id="catalog">
                <Container className="catalog-content">
                    <div>
                        <h1>Профіль</h1>
                        {profile && (
                            <>
                                <p>Ваша роль: {profile.role}</p>
                                <p>Баланс: {profile.balance} грн</p>
                                
                                <div className="balance-controls">
                                    <Button 
                                        onClick={() => setShowDepositModal(true)}
                                        variant="success"
                                        className="me-2"
                                    >
                                        Поповнити баланс
                                    </Button>
                                    <Button 
                                        onClick={() => setShowWithdrawModal(true)}
                                        variant="primary"
                                    >
                                        Вивести кошти
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
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
        </section>
    );
};

export default Profile;
