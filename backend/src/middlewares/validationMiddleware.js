// src/middlewares/validationMiddleware.js
const { validationResult } = require('express-validator');
const { getMessage } = require('../constants/messages');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const formatted = errors.array().map(e => ({ field: e.param, message: e.msg, value: e.value }));
  return res.status(400).json({ success: false, message: getMessage('VALIDATION_ERROR'), errors: formatted });
};

module.exports = { validate };
