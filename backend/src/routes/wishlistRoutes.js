const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/WishlistController');
const { authenticate } = require('../middlewares/authMiddleware');

// Apply authMiddleware to all wishlist routes
router.use(authenticate);

router.post('/', WishlistController.addToWishlist);
router.delete('/:productId', WishlistController.removeFromWishlist);
router.get('/', WishlistController.getWishlist);

module.exports = router;
