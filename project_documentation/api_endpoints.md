# API Endpoints Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the FanVers project, including authentication, user management, catalog operations, and other system features.

## Authentication Endpoints

### Login
```
POST /api/auth/jwt/create/
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Register
```
POST /api/auth/users/
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "re_password": "password123"
}
```

### Refresh Token
```
POST /api/auth/jwt/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Logout
```
POST /api/auth/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## User Management Endpoints

### Get User Profile
```
GET /api/users/profile/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "username": "user",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "balance": 1000.00,
  "role": "Translator",
  "commission": 15.0,
  "image": "http://localhost:8000/media/profile_images/user.jpg",
  "about": "User description",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Update Profile
```
PUT /api/users/profile/update/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "about": "Updated description"
}
```

### Upload Profile Image
```
POST /api/users/profile/upload-image/
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

image: <file>
```

### Delete Profile Image
```
DELETE /api/users/profile/delete-image/
Authorization: Bearer <access_token>
```

### Update Email
```
POST /api/users/profile/update-email/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "new_email": "newemail@example.com"
}
```

### Change Password
```
POST /api/users/profile/change-password/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "old_password": "oldpassword",
  "new_password": "newpassword",
  "confirm_password": "newpassword"
}
```

### Get User Statistics
```
GET /api/users/profile/statistics/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "total_books_count": 5,
  "total_chapters": 25,
  "total_characters": 150000,
  "commission": 15.0,
  "daily_income": 50.0,
  "monthly_income": 500.0,
  "daily_views": 10,
  "last_activity": "2024-01-01T12:00:00Z"
}
```

## Balance Management

### Add Balance
```
POST /api/users/add-balance/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 100.00
}
```

### Withdraw Balance
```
POST /api/users/withdraw-balance/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 50.00
}
```

### Update Balance
```
POST /api/users/update-balance/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 25.00
}
```

### Purchase Chapter
```
POST /api/users/purchase-chapter/{chapter_id}/
Authorization: Bearer <access_token>
```

## Catalog Endpoints

### Get Books List
```
GET /api/catalog/books/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number
- `page_size`: Items per page
- `search`: Search query
- `genre`: Genre filter
- `book_type`: Book type filter (AUTHOR, TRANSLATION)
- `translation_status`: Translation status filter
- `adult_content`: Adult content filter

### Get Book Details
```
GET /api/catalog/books/{book_id}/
Authorization: Bearer <access_token>
```

### Create Book
```
POST /api/catalog/books/create/
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

title: "Book Title"
author: "Author Name"
description: "Book description"
country: 1
genres[]: 1
genres[]: 2
book_type: "TRANSLATION"
translation_status: "TRANSLATING"
original_status: "ONGOING"
adult_content: false
cover_image: <file>
```

### Update Book
```
PUT /api/catalog/books/{book_id}/
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

# Same fields as create
```

### Delete Book
```
DELETE /api/catalog/books/{book_id}/
Authorization: Bearer <access_token>
```

### Get User Translations
```
GET /api/catalog/user-translations/
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Book Title",
    "title_en": "Book Title EN",
    "author": "Author Name",
    "description": "Book description",
    "image": "http://localhost:8000/media/books/image.jpg",
    "translation_status": "TRANSLATING",
    "translation_status_display": "Translating",
    "original_status": "ONGOING",
    "original_status_display": "Ongoing",
    "country": {...},
    "genres": [...],
    "tags": [...],
    "fandoms": [...],
    "adult_content": false,
    "book_type": "TRANSLATION"
  }
]
```

## Chapter Management

### Get Chapters List
```
GET /api/catalog/chapters/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `book`: Book ID filter
- `page`: Page number
- `page_size`: Items per page

### Get Chapter Details
```
GET /api/catalog/chapters/{chapter_id}/
Authorization: Bearer <access_token>
```

### Create Chapter
```
POST /api/catalog/chapters/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "book": 1,
  "title": "Chapter Title",
  "content": "Chapter content...",
  "chapter_number": 1,
  "price": 10.00
}
```

### Update Chapter
```
PUT /api/catalog/chapters/{chapter_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

# Same fields as create
```

### Delete Chapter
```
DELETE /api/catalog/chapters/{chapter_id}/
Authorization: Bearer <access_token>
```

## Rating System

### Get Book Ratings
```
GET /api/rating/{book_slug}/book-ratings/
```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "rating": 5,
      "rating_type": "BOOK",
      "user": "username",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "average_rating": 5.0
}
```

### Submit Rating
```
POST /api/rating/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "book_slug": "book-slug",
  "rating_type": "BOOK",
  "rating": 5
}
```

## Search and Filtering

### Search Books
```
GET /api/search/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `q`: Search query
- `genre`: Genre filter
- `book_type`: Book type filter
- `translation_status`: Translation status filter
- `adult_content`: Adult content filter
- `page`: Page number
- `page_size`: Items per page

### Get Search Filters
```
GET /api/search/filters/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "genres": [
    {"id": 1, "name": "Fantasy"},
    {"id": 2, "name": "Romance"}
  ],
  "countries": [
    {"id": 1, "name": "USA"},
    {"id": 2, "name": "UK"}
  ],
  "book_types": [
    {"value": "AUTHOR", "label": "Original"},
    {"value": "TRANSLATION", "label": "Translation"}
  ]
}
```

## Comments and Reviews

### Get Book Comments
```
GET /api/reviews/book-comments/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `book`: Book ID filter
- `page`: Page number
- `page_size`: Items per page

### Create Book Comment
```
POST /api/reviews/book-comments/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "book": 1,
  "content": "Comment text"
}
```

### Get Chapter Comments
```
GET /api/reviews/chapter-comments/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `chapter`: Chapter ID filter
- `page`: Page number
- `page_size`: Items per page

### Create Chapter Comment
```
POST /api/reviews/chapter-comments/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "chapter": 1,
  "content": "Comment text"
}
```

## Navigation and Bookmarks

### Get User Bookmarks
```
GET /api/navigation/bookmarks/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status`: Bookmark status filter
- `page`: Page number
- `page_size`: Items per page

### Create Bookmark
```
POST /api/navigation/bookmarks/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "chapter": 1,
  "status": "reading"
}
```

### Update Bookmark
```
PUT /api/navigation/bookmarks/{bookmark_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "completed"
}
```

### Delete Bookmark
```
DELETE /api/navigation/bookmarks/{bookmark_id}/
Authorization: Bearer <access_token>
```

## Website Advertising

### Get Main Page Ads
```
GET /api/website_advertising/main-page-ads/
```

**Response:**
```json
[
  {
    "id": 1,
    "book": {
      "id": 1,
      "title": "Book Title",
      "author": "Author Name",
      "image": "http://localhost:8000/media/books/image.jpg"
    },
    "location": "main",
    "order": 1,
    "is_active": true
  }
]
```

### Get Catalog Ads
```
GET /api/website_advertising/catalog-ads/
```

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"],
  "non_field_errors": ["General error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 429 Too Many Requests
```json
{
  "detail": "Request was throttled.",
  "scope": "rating",
  "available_in_sec": 30,
  "error_type": "throttled"
}
```

## Rate Limiting

### Rate Limits by Endpoint Type
- **User operations**: 240 requests/minute
- **Anonymous users**: 120 requests/minute
- **Rating operations**: 30 requests/minute
- **Upload operations**: 20 requests/hour
- **Purchase operations**: 10 requests/hour
- **Balance operations**: 100 requests/hour

### Rate Limit Headers
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets
- `Retry-After`: Seconds to wait before retrying

## Authentication

### JWT Token Format
```
Authorization: Bearer <access_token>
```

### Token Expiration
- **Access Token**: 60 minutes
- **Refresh Token**: 24 hours

### Token Refresh
When access token expires, use refresh token to get new access token:
```
POST /api/auth/jwt/refresh/
{
  "refresh": "<refresh_token>"
}
```

## Pagination

### Standard Pagination
```json
{
  "count": 100,
  "next": "http://api.example.com/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

### Custom Pagination
Some endpoints use custom pagination with different field names.

## File Uploads

### Supported File Types
- **Images**: JPEG, PNG, WebP
- **Maximum size**: 5MB

### Upload Endpoints
- Profile images: `/api/users/profile/upload-image/`
- Book covers: `/api/catalog/books/create/`

### File Response Format
```json
{
  "image_url": "http://localhost:8000/media/profile_images/user.jpg?v=1234567890",
  "has_custom_image": true
}
```
