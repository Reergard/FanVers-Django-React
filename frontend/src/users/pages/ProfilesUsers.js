import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { usersAPI } from '../../api/users/usersAPI';;
import "../styles/ProfilesUsers.css";

const ProfilesUsers = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await usersAPI.getUserProfile(userId);
                setProfile(data);
            } catch (error) {
                console.error('Помилка при завантаженні профілю:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    if (loading) {
        return <div>Завантаження...</div>;
    }

    if (!profile) {
        return <div>Профіль не знайдено</div>;
    }

    return (
        <Container className="mt-4">
            <Card className="profile-card">
                <Card.Body>
                    <Row>
                        <Col md={4} className="text-center">
                            {profile.image && (
                                <img
                                    src={profile.image}
                                    alt={profile.username}
                                    className="profile-avatar mb-3"
                                />
                            )}
                        </Col>
                        <Col md={8}>
                            <h2>{profile.username}</h2>
                            <p className="text-muted">{profile.role}</p>
                            {profile.about && (
                                <div className="mt-3">
                                    <h5>Про себе:</h5>
                                    <p>{profile.about}</p>
                                </div>
                            )}
                            <div className="mt-3">
                                <h5>Кількість книг: {profile.total_books}</h5>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProfilesUsers;