/**
 * Upload Controller
 * Handles file uploads for product images
 */

/**
 * Upload single image
 * @route POST /api/v1/upload/image
 */
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Generate URL (relative path)
    const fileUrl = `/uploads/products/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload multiple images
 * @route POST /api/v1/upload/images
 */
exports.uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Generate URLs for all uploaded files
    const fileUrls = req.files.map(file => ({
      url: `/uploads/products/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(200).json({
      success: true,
      data: fileUrls,
      message: `${req.files.length} image(s) uploaded successfully`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete image from server
 * @route DELETE /api/v1/upload/image
 */
exports.deleteImage = async (req, res, next) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    const fs = require('fs');
    const path = require('path');
    
    // Construct file path
    const filePath = path.join(__dirname, '../../public/uploads/products', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
