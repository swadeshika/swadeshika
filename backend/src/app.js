// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const { NODE_ENV, CORS_ORIGIN, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } = require('./config/env');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const apiRoutes = require('./routes');

const app = express();

// 1. Security headers
app.use(helmet());

// 2. Logging
if (NODE_ENV === 'development') app.use(morgan('dev'));

// 3. Rate limiter
const limiter = rateLimit({
  max: RATE_LIMIT_MAX || 100,
  windowMs: RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  message: "Too many requests, try again later.",
});
app.use('/api', limiter);

// 4. Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 5. Data sanitization (SQL safe too)
app.use(mongoSanitize());
app.use(xss());

// 6. Prevent HTTP param pollution
app.use(hpp());

// 7. CORS (100% Express 4 safe)
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

// 8. Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// 9. API routes
app.use('/api/v1', apiRoutes);

// 10. Error Handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
