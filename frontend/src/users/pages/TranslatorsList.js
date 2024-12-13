import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
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
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Завантаження...</span>
                </Spinner>
            </Container>
        );
    }

    if (!translators.length) {
        return (
            <Container className="mt-4">
                <h2 className="mb-4">Перекладачі та Літератори</h2>
                <p className="text-center">На даний момент немає активних перекладачів</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Перекладачі та Літератори</h2>
            <Row xs={1} md={2} lg={3} className="g-4">
                {translators.map((translator) => (
                    <Col key={translator.id}>
                        <Card className="translator-card h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    {translator.image ? (
                                        <img
                                            src={translator.image}
                                            alt={translator.username}
                                            className="translator-avatar me-3"
                                        />
                                    ) : (
                                        <div className="translator-avatar-placeholder me-3">
                                            {translator.username[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <Link to={`/profile/${translator.username}`} className="text-decoration-none">
                                            <Card.Title className="mb-1">{translator.username}</Card.Title>
                                        </Link>
                                        <Card.Text className="text-muted mb-0">
                                            {translator.role}
                                            {translator.translation_books_count > 0 && 
                                                <span className="ms-2">
                                                    (Перекладів: {translator.translation_books_count})
                                                </span>
                                            }
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