# Swadeshika E-commerce API Documentation

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

### Obtaining Tokens
1. Register a new user or log in to receive an access token and refresh token.
2. The **Access Token** is returned in the JSON response. Include it in the `Authorization` header for protected routes.
3. The **Refresh Token** is stored in a secure HTTP-only cookie (`refreshToken`).
4. When the access token expires, use the `/auth/refresh-token` endpoint to get a new one.

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Token Types
- **Access Token**: Short-lived (15 minutes), used for API authorization.
- **Refresh Token**: Long-lived (7 days), stored as HTTP-only cookie.

## Rate Limiting
- **100 requests** per 15 minutes per IP address.
- Exceeding the limit returns HTTP `429 Too Many Requests`.

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    }
  ]
}
```

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Endpoints

### Authentication Endpoints

#### 1. Register New User
Creates a new user account.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Auth Required:** No

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+919876543210"
}
```
*Note: Password must be at least 8 characters and include uppercase, lowercase, number, and special character.*

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid-string",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "accessToken": "jwt-access-token-string"
  }
}
```

---

#### 2. Login User
Authenticates a user and returns tokens.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth Required:** No

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
      "id": "uuid-string",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "accessToken": "jwt-access-token-string"
  }
}
```
*Note: A `refreshToken` cookie is also set in the response.*

---

#### 3. Refresh Access Token
Generates a new access token using the refresh token cookie.

- **URL:** `/auth/refresh-token`
- **Method:** `POST`
- **Auth Required:** No (uses Cookie)

**Headers:**
```
Cookie: refreshToken=<refresh_token_value>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-access-token-string"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Refresh token is invalid or expired"
}
```

---

#### 4. Get Current User (Me)
Returns the profile of the currently logged-in user.

- **URL:** `/auth/me`
- **Method:** `GET`
- **Auth Required:** Yes

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+919876543210",
    "role": "customer",
    "created_at": "2023-11-22T10:00:00.000Z",
    "updated_at": "2023-11-22T10:00:00.000Z"
  }
}
```

---

#### 5. Forgot Password
Generates a new random password and emails it to the user.

- **URL:** `/auth/forgot-password`
- **Method:** `POST`
- **Auth Required:** No

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
  "message": "If the email exists, a new password has been sent."
}
```

---

#### 6. Reset Password
*Deprecated in favor of auto-generated password flow, but endpoint exists for manual resets via token if needed.*

- **URL:** `/auth/reset-password/:token`
- **Method:** `POST`
- **Auth Required:** No

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

---

#### 7. Logout User
Clears the refresh token cookie.

- **URL:** `/auth/logout`
- **Method:** `POST`
- **Auth Required:** Yes

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```
