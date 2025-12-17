const BlogAuthorModel = require('../models/blogAuthorModel');

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

    static async createAuthor(req, res, next) {
        try {
            const id = await BlogAuthorModel.create(req.body);
            res.status(201).json({ success: true, message: 'Author created', data: { id, ...req.body } });
        } catch (error) {
            next(error);
        }
    }

    static async updateAuthor(req, res, next) {
        try {
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
