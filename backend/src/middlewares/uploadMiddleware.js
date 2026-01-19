const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Ensure upload directory exists (fallback for local dev if needed, or remove)
// const uploadDir = path.join(__dirname, '../../public/uploads/products');

/**
 * Configure Cloudinary Storage
 * - Files uploaded to: swadeshika/products
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'swadeshika/products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    public_id: (req, file) => `product-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
  },
});

/**
 * File filter - only allow image files
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'));
  }
};

/**
 * Create multer upload instance
 * - Max file size: 5MB
 * - Only image files allowed
 */
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
