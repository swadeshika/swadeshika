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
            const params = parameters || {};
            
            // Generate Data based on Type
            let data = [];
            let columns = [];
            
            if (reportType === 'sales') {
                const startDate = params.startDate || new Date(new Date().setDate(new Date().getDate() - 30));
                const endDate = params.endDate || new Date();
                
                const [orders] = await db.query(
                    `SELECT order_number, total_amount, status, created_at, payment_method 
                     FROM orders 
                     WHERE created_at BETWEEN ? AND ?`,
                    [startDate, endDate]
                );
                
                columns = ['Order Number', 'Amount', 'Status', 'Date', 'Payment'];
                data = orders.map(o => [
                    o.order_number, 
                    o.total_amount, 
                    o.status, 
                    new Date(o.created_at).toISOString().split('T')[0],
                    o.payment_method
                ]);
            } else if (reportType === 'customers') {
                 const [users] = await db.query('SELECT name, email, role, created_at FROM users WHERE role="customer"');
                 columns = ['Name', 'Email', 'Role', 'Joined'];
                 data = users.map(u => [u.name, u.email, u.role, new Date(u.created_at).toISOString().split('T')[0]]);
            }

            // Simple CSV Builder
            const csvContent = [
                columns.join(','),
                ...data.map(row => row.join(','))
            ].join('\n');
            
            // In a real app, upload to S3. Here, we'll return a data URI or just mock a hosted URL representing this content.
            // For this fix, we will simulate a "Completed" file that the frontend can "download" (conceptually).
            // Since we don't have S3, we'll store the CSV string in the DB 'parameters' for retrieval or just a placeholder 
            // but we want to show we *tried* to get real data.
            
            // Better approach for this environment: Save CSV content to a temporary public file?
            // Or just return the data directly in the 'file_url' as a data URI!
            const base64Data = Buffer.from(csvContent).toString('base64');
            const dataUri = `data:text/csv;base64,${base64Data}`;

            const [result] = await db.query(
                `INSERT INTO reports (report_type, name, format, parameters, status, generated_by, file_url)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [reportType, name, format, JSON.stringify(params), 'completed', generatedBy, dataUri]
            );

            res.status(202).json({
                success: true,
                message: "Report generated successfully",
                data: {
                    reportId: result.insertId,
                    status: 'completed'
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
