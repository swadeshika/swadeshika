const express = require('express');
const router = express.Router();
const { createPost, updatePost, deletePost } = require('../controllers/blogController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, authorize('admin'), createPost);
router.put('/:id', authenticate, authorize('admin'), updatePost);
router.delete('/:id', authenticate, authorize('admin'), deletePost);

module.exports = router;
