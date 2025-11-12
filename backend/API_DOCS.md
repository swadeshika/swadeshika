# Swadeshika E-commerce API Documentation

This document provides detailed information about the Swadeshika E-commerce API endpoints, including request/response formats and examples.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using a JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. Authentication

#### Register a new user

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
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

---

#### Login user

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
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
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
