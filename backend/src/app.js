// src/app.js
require('express-async-errors');
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

// Security headers
app.use(helmet());

// Logging
if (NODE_ENV === 'development') app.use(morgan('dev'));

// Rate limiter (applies to API)
const limiter = rateLimit({
  max: parseInt(RATE_LIMIT_MAX, 10) || 100,
  windowMs: parseInt(RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body + cookie parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization (safe to keep even for SQL; mainly defends against malicious payloads)
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// CORS
app.use(cors({
  origin: CORS_ORIGIN || '*',
  credentials: true,
}));
app.options('*', cors());

// Static
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes (versioned)
app.use('/api/v1', apiRoutes);

// 404 and error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
