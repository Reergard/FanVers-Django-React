import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { addBookmark, updateBookmark, getBookmarkStatus } from '../api';
import '../css/BookmarkButton.css'; // Создайте этот файл для стилей

const STATUS_LABELS = {
    'reading': 'Читаю',
    'dropped': 'Кинув читати',
    'planned': 'В планах',
    'completed': 'Прочитав',
};

const BookmarkButton = ({ bookId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: bookmarkData, isLoading } = useQuery({
        queryKey: ['bookmark-status', bookId],
        queryFn: () => getBookmarkStatus(bookId),
        enabled: !!bookId,
    });

    const addMutation = useMutation({
        mutationFn: (newStatus) => addBookmark(bookId, newStatus),
        onSuccess: () => {
            queryClient.invalidateQueries(['bookmark-status', bookId]);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (newStatus) => updateBookmark(bookmarkData.id, newStatus),
        onSuccess: () => {
            queryClient.invalidateQueries(['bookmark-status', bookId]);
        },
    });

    const handleStatusChange = (newStatus) => {
        if (bookmarkData?.id) {
            updateMutation.mutate(newStatus);
        } else {
            addMutation.mutate(newStatus);
        }
        setIsOpen(false);
    };

    if (isLoading) return <div>Loading...</div>;

    const currentLabel = bookmarkData?.status ? STATUS_LABELS[bookmarkData.status] : 'В Закладки';

    return (
        <div className="bookmark-button-container">
            <button 
                className="bookmark-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                {currentLabel}
            </button>
            
            {isOpen && (
                <div className="bookmark-dropdown">
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <button 
                            key={value} 
                            onClick={() => handleStatusChange(value)}
                            className={`status-button ${bookmarkData?.status === value ? 'active' : ''}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookmarkButton;
