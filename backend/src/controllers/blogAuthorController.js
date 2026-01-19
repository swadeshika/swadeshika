const BlogAuthorModel = require('../models/blogAuthorModel');
const cloudinary = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

class BlogAuthorController {
    static async getAllAuthors(req, res, next) {
        try {
            const authors = await BlogAuthorModel.findAll();
            res.json({ success: true, data: authors });
        } catch (error) {
            next(error);
        }
    }

    static async getAuthor(req, res, next) {
        try {
            const author = await BlogAuthorModel.findById(req.params.id);
            if (!author) {
                return res.status(404).json({ success: false, message: 'Author not found' });
            }
            res.json({ success: true, data: author });
        } catch (error) {
            next(error);
        }
    }

    static async saveDataUrlImage(dataUrl) {
        const match = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (!match) return null;

        try {
            const result = await cloudinary.uploader.upload(dataUrl, {
                folder: 'swadeshika/authors',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                public_id: `author-${Date.now()}-${uuidv4()}`
            });
            return result.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            return null;
        }
    }

    static async createAuthor(req, res, next) {
        try {
            let { name, bio, avatar, email, social_links } = req.body;

            // Handle base64 avatar
            if (avatar && avatar.startsWith('data:')) {
                const url = await BlogAuthorController.saveDataUrlImage(avatar);
                if (url) req.body.avatar = url;
            }

            const id = await BlogAuthorModel.create(req.body);
            res.status(201).json({ success: true, message: 'Author created', data: { id, ...req.body } });
        } catch (error) {
            next(error);
        }
    }

    static async updateAuthor(req, res, next) {
        try {
            let { avatar } = req.body;

            // Handle base64 avatar
            if (avatar && avatar.startsWith('data:')) {
                const url = await BlogAuthorController.saveDataUrlImage(avatar);
                if (url) req.body.avatar = url;
            }

            const updated = await BlogAuthorModel.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Author not found' });
            }
            res.json({ success: true, message: 'Author updated' });
        } catch (error) {
            next(error);
        }
    }

    static async deleteAuthor(req, res, next) {
        try {
            const deleted = await BlogAuthorModel.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Author not found' });
            }
            res.json({ success: true, message: 'Author deleted' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BlogAuthorController;
