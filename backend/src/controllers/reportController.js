const db = require('../config/db');

class ReportController {
    /**
     * Generate a new report (Async job placeholder)
     * For now, it creates a record with 'pending' status.
     */
    static async generateReport(req, res, next) {
        try {
            const { reportType, name, format, parameters } = req.body;
            const generatedBy = req.user.id;

            // In a real system, you would push this to a queue (Bull, RabbitMQ)
            // Here we just insert the record.
            const [result] = await db.query(
                `INSERT INTO reports (report_type, name, format, parameters, status, generated_by, file_url)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [reportType, name, format, JSON.stringify(parameters), 'completed', generatedBy, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf']
            );

            // Simulate async processing (Optional: usually handled by a worker)
            // setTimeout(() => processReport(result.insertId), 1000);

            res.status(202).json({
                success: true,
                message: "Report generation started",
                data: {
                    reportId: result.insertId,
                    status: 'pending'
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * List generated reports
     */
    static async getReports(req, res, next) {
        try {
            const { page = 1, limit = 20, type, status } = req.query;
            const offset = (page - 1) * limit;

            let query = `SELECT r.*, u.name as generated_by_name 
                         FROM reports r
                         LEFT JOIN users u ON r.generated_by = u.id
                         WHERE 1=1`;
            const params = [];

            if (type) {
                query += ` AND r.report_type = ?`;
                params.push(type);
            }

            if (status) {
                query += ` AND r.status = ?`;
                params.push(status);
            }

            query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));

            const [reports] = await db.query(query, params);

            // Get total count
            const [countResult] = await db.query(`SELECT COUNT(*) as total FROM reports`);

            res.json({
                success: true,
                data: {
                    reports,
                    pagination: {
                        page: parseInt(page),
                        total: countResult[0].total,
                        pages: Math.ceil(countResult[0].total / limit)
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a report
     */
    static async deleteReport(req, res, next) {
        try {
            const { id } = req.params;
            await db.query(`DELETE FROM reports WHERE id = ?`, [id]);
            res.json({ success: true, message: "Report deleted successfully" });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Download a report
     */
    static async downloadReport(req, res, next) {
        try {
            const { id } = req.params;
            const [rows] = await db.query(`SELECT file_url FROM reports WHERE id = ?`, [id]);

            if (rows.length === 0 || !rows[0].file_url) {
                return res.status(404).json({ success: false, message: "File not found" });
            }

            // In a real app, you might stream the file from S3 or local disk
            // res.download(rows[0].file_url);
            res.redirect(rows[0].file_url);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ReportController;
