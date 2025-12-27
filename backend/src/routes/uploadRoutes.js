const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const uploadController = require('../controllers/uploadController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * Upload Routes
 * All routes require admin authentication
 */

/**
 * POST /api/v1/upload/image
 * Upload single image
 * Body: FormData with 'image' field
 */
router.post(
  '/image',
  authenticate,
  authorize('admin'),
  upload.single('image'),
  uploadController.uploadImage
);

/**
 * POST /api/v1/upload/images
 * Upload multiple images (max 10)
 * Body: FormData with 'images' field (multiple files)
 */
router.post(
  '/images',
  authenticate,
  authorize('admin'),
  upload.array('images', 10), // Max 10 images at once
  uploadController.uploadMultipleImages
);

/**
 * DELETE /api/v1/upload/image
 * Delete an uploaded image
 * Body: { filename: 'product-xxx.png' }
 */
router.delete(
  '/image',
  authenticate,
  authorize('admin'),
  uploadController.deleteImage
);

module.exports = router;
