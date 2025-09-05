# Troubleshooting Guide

## Common Issues and Solutions

### 1. Backend Connection Issues

**Symptoms:**
- All API requests return `ERR_CONNECTION_REFUSED`
- Browser console shows: `Failed to load resource: net::ERR_CONNECTION_REFUSED`

**Solution:**
```bash
cd backend
python manage.py runserver
```

**Verification:**
```bash
curl http://localhost:8000/api/catalog/genres/
# Should return genre list or 401 (if not authenticated)
```

### 2. Authentication Problems

**Symptoms:**
- HTTP 401 Unauthorized
- "Authentication required" message

**Solution:**
1. Check token in localStorage
2. Re-login
3. Verify JWT token expiration

**Debug Steps:**
```javascript
// Check token in browser console
console.log('Token:', localStorage.getItem('token'));
console.log('Refresh:', localStorage.getItem('refresh'));

// Check token expiration
const token = localStorage.getItem('token');
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token expires:', new Date(payload.exp * 1000));
}
```

### 3. Form Validation Issues

**Symptoms:**
- HTTP 400 Bad Request
- Validation error messages

**Diagnosis:**
1. Check browser console for validation errors
2. Check backend logs for detailed error information
3. Ensure all required fields are filled

**Common Validation Errors:**
- Missing required fields
- Invalid file types
- File size too large
- Invalid data format

### 4. Permission Issues

**Symptoms:**
- HTTP 403 Forbidden
- "You don't have permission" message

**Solution:**
1. Check user role in profile
2. Ensure role is "Translator" or "Author"
3. Verify permissions in backend settings

## Step-by-Step Diagnostics

### Step 1: Check Backend
```bash
# In backend terminal
python manage.py runserver

# Expected output:
# Watching for file changes with StatReloader
# Performing system checks...
# System check identified no issues (0 silenced).
# Starting development server at http://127.0.0.1:8000/
```

### Step 2: Check API Endpoints
```bash
# Without authentication
curl http://localhost:8000/api/catalog/genres/
# Should return 401

# With authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/catalog/genres/
# Should return genre list
```

### Step 3: Test Book Creation
```bash
curl -X POST http://localhost:8000/api/catalog/books/create/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Test Book" \
  -F "author=Test Author" \
  -F "country=1" \
  -F "genres[]=1" \
  -F "book_type=TRANSLATION" \
  -F "translation_status=TRANSLATING" \
  -F "original_status=ONGOING"
```

## Log Analysis

### Frontend Logs
- `BookCreate Debug:` - Form and user state
- `catalogAPI.createBook:` - Book creation process
- `BookCreate: Attempting form submission` - Form submission start

### Backend Logs
- `create_book: Request received from user` - Request received
- `BookCreateSerializer.validate:` - Data validation
- `create_book: Book successfully created` - Successful creation

### Authentication Logs
- `useAuth: Checking conditions` - Authentication checks
- `Force logout executed` - Forced logout events
- `Token refresh successful` - Token refresh operations

## Common Problems

### 1. Incorrect Content-Type
- Must be `multipart/form-data` for forms with files
- Check headers in browser Network tab

### 2. Incorrect Data Structure
- Arrays must be sent as `field[]`
- Check FormData in console

### 3. File Issues
- Check file size and type
- Ensure file is not corrupted

### 4. Infinite Redirects
- Check `useAuth` hook logic
- Verify `isAuthenticated` state
- Check for circular dependencies

### 5. Token Issues
- Verify token format
- Check token expiration
- Ensure proper token refresh

## Debugging Tools

### Browser Developer Tools
1. **Console Tab**: Check for JavaScript errors
2. **Network Tab**: Monitor API requests and responses
3. **Application Tab**: Check localStorage and sessionStorage
4. **Sources Tab**: Set breakpoints for debugging

### Backend Debugging
1. **Django Debug Toolbar**: Install for detailed request information
2. **Logging**: Enable detailed logging in settings
3. **Database Queries**: Use `django-debug-toolbar` to monitor queries

### Network Debugging
```bash
# Check if backend is running
netstat -tlnp | grep :8000

# Test API endpoints
curl -v http://localhost:8000/api/catalog/genres/

# Check Redis connection
redis-cli ping
```

## Performance Issues

### 1. Slow API Responses
- Check database queries
- Enable query logging
- Use database indexes
- Implement caching

### 2. Memory Issues
- Check for memory leaks
- Monitor Redis memory usage
- Optimize image processing

### 3. High CPU Usage
- Check for infinite loops
- Monitor background tasks
- Optimize algorithms

## Security Issues

### 1. CORS Errors
- Check CORS settings in Django
- Verify allowed origins
- Check preflight requests

### 2. Authentication Bypass
- Verify JWT token validation
- Check permission classes
- Test with invalid tokens

### 3. Rate Limiting
- Check throttling settings
- Monitor rate limit headers
- Adjust limits if needed

## Checklist for Verification

- [ ] Backend running on port 8000
- [ ] JWT token valid and not expired
- [ ] User has "Translator" or "Author" role
- [ ] All required fields filled
- [ ] Form is valid (no console errors)
- [ ] API endpoint accessible
- [ ] No CORS errors
- [ ] Files upload correctly
- [ ] No infinite redirects
- [ ] Token refresh working
- [ ] Rate limiting appropriate

## Emergency Procedures

### If Nothing Works:

1. **Clear Browser Cache**
   - Hard refresh (Ctrl+F5)
   - Clear localStorage
   - Clear sessionStorage

2. **Restart Backend**
   ```bash
   # Stop backend
   Ctrl+C
   
   # Clear Python cache
   find . -name "*.pyc" -delete
   find . -name "__pycache__" -type d -exec rm -rf {} +
   
   # Restart backend
   python manage.py runserver
   ```

3. **Check System Resources**
   - Available memory
   - Disk space
   - Network connectivity

4. **Verify Configuration**
   - Django settings
   - Environment variables
   - Database connection

5. **Check Logs**
   - Django logs
   - Nginx logs
   - System logs

## Getting Help

### Information to Provide:
1. **Error Messages**: Exact error text
2. **Steps to Reproduce**: Detailed steps
3. **Environment**: OS, browser, versions
4. **Logs**: Relevant log entries
5. **Configuration**: Relevant settings

### Useful Commands:
```bash
# Check Django version
python -c "import django; print(django.get_version())"

# Check installed packages
pip list

# Check database migrations
python manage.py showmigrations

# Check for errors
python manage.py check
```
