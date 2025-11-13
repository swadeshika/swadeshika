// src/middlewares/errorMiddleware.js
const { getMessage } = require('../constants/messages');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: getMessage('NOT_FOUND') });
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || getMessage('INTERNAL_SERVER_ERROR'),
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    response.code = err.code;
  }

  res.status(statusCode).json(response);
};

module.exports = { errorHandler, asyncHandler, notFound };
