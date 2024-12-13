import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { usersAPI } from '../../api/users/usersAPI';
import "../styles/TranslatorsList.css";

const TranslatorsList = () => {
    const [translators, setTranslators] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTranslators = async () => {
            try {
                const data = await usersAPI.getTranslatorsList();
                setTranslators(data);
            } catch (error) {
                console.error('Помилка при завантаженні списку перекладачів:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTranslators();
    }, []);

    if (loading) {
        return <div>Завантаження...</div>;
    }

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Перекладачі та Літератори</h2>
            <Row xs={1} md={2} lg={3} className="g-4">
                {translators.map((translator) => (
                    <Col key={translator.id}>
                        <Card className="translator-card">
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    {translator.image && (
                                        <img
                                            src={translator.image}
                                            alt={translator.username}
                                            className="translator-avatar me-3"
                                        />
                                    )}
                                    <div>
                                        <Link to={`/profile/${translator.username}`}>
                                            <Card.Title>{translator.username}</Card.Title>
                                        </Link>
                                        <Card.Text className="text-muted">
                                            {translator.role}
                                        </Card.Text>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default TranslatorsList;