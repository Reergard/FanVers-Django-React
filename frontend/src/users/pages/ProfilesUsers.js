import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { usersAPI } from '../../api';
import { ProfileImage } from '../../main/components/Header/ProfileImage';
import { FALLBACK_IMAGES, IMAGE_SIZES } from '../../constants/fallbackImages';
import "../styles/ProfilesUsers.css";

const ProfilesUsers = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await usersAPI.getUserProfile(username);
                setProfile(data);
            } catch (error) {
                console.error('Помилка при завантаженні профілю:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

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
                            <ProfileImage
                                src={profile.profile_image_large || profile.image}
                                alt={profile.username}
                                className="profile-avatar mb-3"
                                size={IMAGE_SIZES.PROFILE_PAGE}
                                fallbackLarge={FALLBACK_IMAGES.LARGE}
                                fallbackSmall={FALLBACK_IMAGES.SMALL}
                            />
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
                                <h5>Кількість книг: {profile.total_books || 0}</h5>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProfilesUsers;