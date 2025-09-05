# FanVers Project Documentation

## Overview

This directory contains comprehensive documentation for the FanVers project - a platform for reading and translating books that connects readers, translators, and authors in a unified ecosystem.

## Documentation Structure

### Core System Documentation

#### [Project Overview](project_overview.md)
- Complete system architecture overview
- Technology stack details
- Module descriptions and relationships
- Database schema
- Business logic and user roles

#### [Authentication System](authentication_system.md)
- JWT token management
- Redux state management for auth
- Automatic token refresh
- Route protection
- Security implementation

#### [Throttling System](throttling_system.md)
- Multi-level protection strategy
- Nginx edge protection
- DRF throttling configuration
- Smart throttling algorithms
- Performance optimization

### Configuration Guides

#### [Nginx Configuration](nginx_configuration.md)
- Production-ready Nginx setup
- Security headers and SSL/TLS
- Rate limiting and DDoS protection
- Performance optimization
- Monitoring and logging

#### [API Endpoints](api_endpoints.md)
- Complete API reference
- Authentication endpoints
- User management
- Catalog operations
- Error handling and rate limiting

### Troubleshooting and Support

#### [Troubleshooting Guide](troubleshooting_guide.md)
- Common issues and solutions
- Step-by-step diagnostics
- Debugging tools and techniques
- Performance troubleshooting
- Emergency procedures

### Development Documentation

#### [Book Creation Integration](BookCreationIntegration.md)
- Book creation workflow
- Form validation and submission
- File upload handling
- Error handling and user feedback

## Quick Start

### For Developers
1. Start with [Project Overview](project_overview.md) to understand the system
2. Review [Authentication System](authentication_system.md) for auth implementation
3. Check [API Endpoints](api_endpoints.md) for API usage
4. Use [Troubleshooting Guide](troubleshooting_guide.md) for debugging

### For System Administrators
1. Review [Nginx Configuration](nginx_configuration.md) for server setup
2. Check [Throttling System](throttling_system.md) for performance tuning
3. Use [Troubleshooting Guide](troubleshooting_guide.md) for maintenance

### For API Users
1. Start with [API Endpoints](api_endpoints.md) for complete API reference
2. Review authentication requirements in [Authentication System](authentication_system.md)
3. Check rate limiting information in [Throttling System](throttling_system.md)

## Technology Stack

### Backend
- **Django 5.1.3** - Web framework
- **Django REST Framework** - API framework
- **Django Channels** - WebSocket support
- **Celery** - Task queue
- **Redis** - Caching and message broker
- **PostgreSQL/SQLite** - Database

### Frontend
- **React 18.3.1** - UI library
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **React Query** - Server state management

### Infrastructure
- **Nginx** - Web server and reverse proxy
- **Gunicorn/Uvicorn** - WSGI/ASGI server
- **Redis** - Caching and session storage

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Automatic token refresh
- Role-based access control
- Secure session management

### Content Management
- Book and chapter management
- File upload handling
- Content moderation
- Search and filtering

### User Management
- Profile management
- Balance and payment system
- Statistics and analytics
- Notification system

### Performance & Security
- Multi-level throttling
- DDoS protection
- Caching strategies
- Rate limiting

## Contributing

When updating documentation:
1. Keep it current with actual code implementation
2. Use clear, concise language
3. Include code examples where helpful
4. Update the table of contents
5. Test all examples and procedures

## Support

For questions or issues:
1. Check the [Troubleshooting Guide](troubleshooting_guide.md)
2. Review relevant system documentation
3. Check the project's issue tracker
4. Contact the development team

---

*Last updated: January 2025*
*Version: 1.0*
