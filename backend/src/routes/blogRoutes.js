const express = require('express');
const router = express.Router();
const { getAllPosts, getPostBySlug } = require('../controllers/blogController');

router.get('/', getAllPosts);
router.get('/:slug', getPostBySlug);

module.exports = router;
