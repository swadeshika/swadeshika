const express = require('express');
const router = express.Router();
const BlogAuthorController = require('../controllers/blogAuthorController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', authenticate, authorize('admin'), BlogAuthorController.getAllAuthors);
router.get('/:id', authenticate, authorize('admin'), BlogAuthorController.getAuthor);
router.post('/', authenticate, authorize('admin'), BlogAuthorController.createAuthor);
router.put('/:id', authenticate, authorize('admin'), BlogAuthorController.updateAuthor);
router.delete('/:id', authenticate, authorize('admin'), BlogAuthorController.deleteAuthor);

module.exports = router;
