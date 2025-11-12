# Swadeshika E-commerce Platform

A modern, full-stack e-commerce platform built with Next.js, Node.js, and MySQL.

## Features

- 🛍️ **Product Catalog** - Browse products with categories, filters, and search
- 🔐 **User Authentication** - Secure signup, login, and password management
- 🛒 **Shopping Cart** - Add/remove items, update quantities
- 💳 **Checkout Process** - Secure payment integration
- 📦 **Order Management** - Track and manage orders
- 👤 **User Dashboard** - Profile management and order history
- 🏪 **Admin Panel** - Manage products, orders, and users

## Tech Stack

### Frontend
- **Framework**: Next.js 13+ (App Router)
- **UI**: Radix UI, Tailwind CSS
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Carousel**: Embla Carousel

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT, bcrypt
- **API**: RESTful API
- **Validation**: express-validator

### Development Tools
- **Package Manager**: npm
- **Environment Management**: dotenv
- **API Testing**: Postman/Insomnia

## Getting Started

### Prerequisites

- Node.js 16.14.0 or later
- MySQL 8.0 or later
- npm 8.0 or later

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/swadeshika-ecommerce.git
   cd swadeshika-ecommerce
   ```

2. **Set up the backend**
   ```bash
   cd backend
   cp .env.example .env
   # Update .env with your database credentials
   npm install
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   cp .env.local.example .env.local
   # Update .env.local with your API URL
   npm install
   ```

4. **Start the development servers**
   ```bash
   # In backend directory
   npm run dev
   
   # In frontend directory (new terminal)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Environment Variables

### Backend (`.env`)
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

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
# Add other frontend environment variables here
```

## Project Structure

```
swadeshika-ecommerce/
├── backend/               # Backend server
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middlewares/  # Custom middlewares
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Utility functions
│   │   └── server.js     # Express server
│   └── package.json
│
├── frontend/              # Frontend Next.js app
│   ├── public/           # Static files
│   ├── src/
│   │   ├── app/         # App router pages
│   │   ├── components/  # Reusable components
│   │   ├── lib/        # Utility functions
│   │   └── styles/     # Global styles
│   └── package.json
│
└── README.md            # This file
```

## API Documentation

Detailed API documentation is available in the [API_DOCS.md](./backend/API_DOCS.md) file.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.
