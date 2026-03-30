# Junior Shopping Site Backend

A robust Node.js backend for an e-commerce platform built with Express.js, TypeScript, Prisma, and PostgreSQL. Features user authentication, product management, rate limiting, and comprehensive logging.

## Features

- **User Authentication**: Register, login, logout, password reset, and profile management with JWT tokens
- **Product Management**: Fetch products by various criteria (all, category, name, ID)
- **Security**: Rate limiting, secure cookies, password hashing, token invalidation
- **Monitoring**: Winston logging, health checks, error tracking
- **Database**: Prisma ORM with PostgreSQL
- **Validation**: Zod schemas for input validation

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt hashing
- **Validation**: Zod
- **Logging**: Winston
- **Rate Limiting**: express-rate-limit

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd juniorshoppingsite-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=4000
   DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Build and Run**
   ```bash
   npm run build
   npm start
   ```
   Or for development:
   ```bash
   npm run dev
   ```

## API Documentation

### Base URL
```
http://localhost:4000
```

### Health Check
- **GET** `/health`
  - Check server status
  - Response: `{ success: true, message: "Server is healthy", timestamp: "2026-03-30T..." }`

### Authentication Endpoints

#### Register User
- **POST** `/api/user/register`
- **Rate Limited**: 5 requests per 15 minutes per IP
- **Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
  ```

#### Login User
- **POST** `/api/user/login`
- **Rate Limited**: 5 requests per 15 minutes per IP
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "generatedToken": "jwt-token-here",
    "data": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
  ```

#### Get User Profile
- **GET** `/api/user/profile`
- **Auth Required**: JWT token in cookies
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "User found",
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
  ```

#### Logout User
- **POST** `/api/user/logout`
- **Auth Required**: JWT token in cookies
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

#### Reset Password
- **POST** `/api/user/reset-password`
- **Rate Limited**: 5 requests per 15 minutes per IP
- **Body**:
  ```json
  {
    "identifier": "john@example.com",
    "newPassword": "NewSecurePass123!"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Password reset successful. You can now login with new password"
  }
  ```

### Product Endpoints

All product endpoints are rate limited to 100 requests per 15 minutes per IP.

#### Get All Products
- **GET** `/api/products`
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Successfully fetched all products",
    "data": [
      {
        "id": "uuid",
        "title": "Product Name",
        "price": 99.99,
        // ... other product fields
      }
    ]
  }
  ```

#### Get Products by Category
- **GET** `/api/products/category/:category`
- **Example**: `/api/products/category/electronics`
- **Response (Success)**:
  ```json
  {
    "success": true,
    "total": 5,
    "data": [
      {
        "id": "uuid",
        "title": "Laptop",
        "price": 999.99,
        // ... selected fields
      }
    ]
  }
  ```

#### Search Products by Name
- **GET** `/api/products/search/:productName`
- **Example**: `/api/products/search/laptop`
- **Response (Success)**:
  ```json
  {
    "success": true,
    "total": 3,
    "data": [
      {
        "id": "uuid",
        "title": "Gaming Laptop",
        // ... selected fields
      }
    ]
  }
  ```

#### Get Product by ID
- **GET** `/api/products/:id`
- **Example**: `/api/products/60d5ecb74b24c72b8c8b4567`
- **Response (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "title": "Product Name",
      "description": "Full description",
      "price": 99.99,
      "images": ["url1", "url2"],
      // ... all product fields
    }
  }
  ```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors, invalid input)
- `401`: Unauthorized (missing/invalid token)
- `404`: Not Found
- `500`: Internal Server Error

## Authentication

- Uses JWT tokens stored in HTTP-only cookies
- Tokens expire in 7 days
- Secure cookies in production (sameSite: 'none', secure: true)
- Tokens are invalidated on logout and password reset

## Rate Limiting

- **General**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP (register, login, reset-password)

## Validation

Input validation using Zod schemas:
- **Password Requirements**: 8+ chars, uppercase, lowercase, number, special char
- **Email**: Valid email format
- **Username**: 2+ characters

## Logging

- Errors logged to `error.log`
- All logs to `combined.log`
- Console logging in development mode

## Database Schema

Uses Prisma with PostgreSQL. Key models:
- **User**: id, username, email, password
- **Token**: id, userId, token
- **Product**: Comprehensive product model with all e-commerce fields

## Deployment

### Docker
```bash
docker build -t juniorshoppingsite-backend .
docker run -p 4000:4000 juniorshoppingsite-backend
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=your-prod-db-url
JWT_SECRET=your-secure-jwt-secret
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

## License

ISC