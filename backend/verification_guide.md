# Blog API Verification Guide

This guide helps you verify the newly implemented Blog API endpoints using Postman.

## Prerequisites
- Ensure the backend server is running (`npm run dev`).
- You need an **Admin** account to test the create/update/delete endpoints.
- You need a **Customer** or **Admin** account (or public access) for reading posts.

## 1. Authentication (Get Token)
First, login as an admin to get the `accessToken`.

**Endpoint:** `POST {{baseUrl}}/auth/login`
**Body:**
```json
{
  "email": "admin@example.com",
  "password": "your_admin_password"
}
```
**Response:** Copy the `accessToken` from the response.

## 2. Create a Blog Post (Admin)
**Endpoint:** `POST {{baseUrl}}/admin/blog`
**Headers:**
- `Authorization`: `Bearer <your_access_token>`
**Body:**
```json
{
  "title": "Benefits of Organic Ghee",
  "content": "Full article content goes here...",
  "excerpt": "Discover why organic ghee is good for you.",
  "featuredImage": "/images/blog/ghee.jpg",
  "category": "Health", 
  "tags": ["ghee", "health", "organic"],
  "status": "published"
}
```
*Note: If the category "Health" does not exist, ensure you create it in the database or use an existing category name.*

## 3. Get All Blog Posts (Public)
**Endpoint:** `GET {{baseUrl}}/blog`
**Query Params (Optional):**
- `page`: 1
- `limit`: 10
- `category`: health
- `search`: ghee

## 4. Get Blog Post by Slug (Public)
**Endpoint:** `GET {{baseUrl}}/blog/benefits-of-organic-ghee`
*(Replace `benefits-of-organic-ghee` with the actual slug returned in step 2)*

## 5. Update Blog Post (Admin)
**Endpoint:** `PUT {{baseUrl}}/admin/blog/:id`
*(Replace `:id` with the blog post ID)*
**Headers:**
- `Authorization`: `Bearer <your_access_token>`
**Body:**
```json
{
  "title": "Updated Benefits of Organic Ghee",
  "status": "archived"
}
```

## 6. Delete Blog Post (Admin)
**Endpoint:** `DELETE {{baseUrl}}/admin/blog/:id`
**Headers:**
- `Authorization`: `Bearer <your_access_token>`

## Troubleshooting
- If you get `401 Unauthorized`, check your Bearer token.
- If you get `403 Forbidden`, ensure your user has `role: 'admin'`.
- If you get `404 Not Found`, check the URL or ID.
