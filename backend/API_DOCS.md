# Swadeshika E-commerce API Documentation

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [User Profile](#user-profile)
  - [Password Management](#password-management)
  - [Products](#products)
  - [Orders](#orders)
  - [Categories](#categories)

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

### Obtaining Tokens
1. Register a new user or log in to receive an access token and refresh token
2. Include the access token in the `Authorization` header for protected routes
3. When the access token expires, use the refresh token to get a new one

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Token Types
- **Access Token**: Short-lived (15 minutes), used for API authorization
- **Refresh Token**: Long-lived (7 days), stored as HTTP-only cookie

## Rate Limiting
- **100 requests** per 15 minutes per IP address
- Exceeding the limit returns HTTP `429 Too Many Requests`

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Endpoints

### Authentication Endpoints

#### Register New User
```http
POST /auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890"
}
```
**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "accessToken": "jwt-token-here"
  }
}
```

#### Login User
```http
POST /auth/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```
**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "accessToken": "jwt-token-here"
  }
}
```

#### Refresh Access Token
```http
POST /auth/refresh-token
```
**Headers:**
```
Cookie: refreshToken=<refresh_token>
```
**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token-here"
  }
}
```

### User Profile

#### Get Current User
```http
GET /users/me
```
**Headers:**
```
Authorization: Bearer <access_token>
```
**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "customer",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Password Management

#### Forgot Password
```http
POST /auth/forgot-password
```
**Request Body:**
```json
{
  "email": "john@example.com"
}
```
**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email"
}
```

#### Reset Password
```http
POST /auth/reset-password/:token
```
**Request Body:**
```json
{
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```
**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

### Products

#### Get All Products
```http
GET /products
```
**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `category` - Filter by category ID
- `sort` - Sort field (name, price, createdAt)
- `order` - Sort order (asc, desc)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "product-1",
        "name": "Handmade Cotton Shirt",
        "description": "Eco-friendly cotton shirt",
        "price": 29.99,
        "stock": 100,
        "category": "Clothing",
        "images": ["image1.jpg", "image2.jpg"],
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

## Security

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### JWT Tokens
- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration (HTTP-only cookie)
- **Reset Token**: 1 hour expiration

## Best Practices
1. Always check response status codes
2. Handle token expiration gracefully
3. Implement retry logic for failed requests
4. Store tokens securely (HTTP-only cookies for web)
5. Never expose sensitive information in client-side code
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

#### Get current user profile

```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone": "+1234567890",
    "createdAt": "2023-01-01T12:00:00.000Z"
  }
}
```

---

#### Refresh access token

```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token_here"
  }
}
```

---

#### Logout user

```http
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

#### Forgot password

```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

---

#### Reset password

```http
POST /auth/reset-password/:token
```

**Request Body:**
```json
{
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Forbidden",
  "code": "FORBIDDEN"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Rate Limiting

API is rate limited to:
- 100 requests per 15 minutes per IP address
- 1000 requests per day per IP address

## Testing the API

You can use tools like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) to test the API endpoints.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=swadeshika
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## Running the Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The API will be available at `http://localhost:5000/api`
