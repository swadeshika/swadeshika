const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Ensure upload directory exists (fallback or remove)
// const uploadDir = path.join(__dirname, '../../public/uploads/contacts');

/**
 * Configure Cloudinary Storage
 * - Files uploaded to: swadeshika/contacts
 */
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'swadeshika/contacts',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
        public_id: (req, file) => `contact-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
    },
});

/**
 * File filter - allow images and PDFs
 */
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        const error = new Error('Only images and PDF files are allowed!');
        error.statusCode = 400;
        cb(error);
    }
};

/**
 * Create multer upload instance
 * - Max file size: 5MB
 */
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

module.exports = upload;
