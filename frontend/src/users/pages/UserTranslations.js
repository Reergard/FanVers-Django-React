import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogAPI } from '../../api/catalog/catalogAPI';
import { Card, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function UserTranslations() {
    const { data: ownedBooks, isLoading, error } = useQuery({
        queryKey: ['ownedBooks'],
        queryFn: catalogAPI.getOwnedBooks,
        onError: (error) => {
            toast.error(error.message);
        }
    });

    if (isLoading) {
        return <div>Завантаження...</div>;
    }

    if (error) {
        return <div>Помилка завантаження: {error.message}</div>;
    }

    const renderBooks = (books) => {
        if (!books?.length) {
            return <p className="text-center">Книг не знайдено</p>;
        }

        return (
            <Row xs={1} md={2} lg={3} className="g-4">
                {books.map((book) => (
                    <Col key={book.id}>
                        <Card>
                            {book.image && (
                                <Card.Img 
                                    variant="top" 
                                    src={book.image} 
                                    alt={book.title}
                                />
                            )}
                            <Card.Body>
                                <Card.Title>{book.title}</Card.Title>
                                <Card.Text>
                                    Автор: {book.author}
                                </Card.Text>
                                <Link 
                                    to={`/catalog/books/${book.slug}`} 
                                    className="btn btn-primary"
                                >
                                    Переглянути
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <Container className="my-4">
            <h1>Мої переклади</h1>
            {renderBooks(ownedBooks)}
        </Container>
    );
}

export default UserTranslations; 