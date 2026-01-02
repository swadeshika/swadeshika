const DashboardModel = require('../models/dashboardModel');

class DashboardService {
    /**
     * Get Dashboard Stats
     * @param {string} range - '7', '30', '90', '365' (days)
     */
    static async getStats(range = '30') {
        const days = parseInt(range);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const startStr = startDate.toISOString().slice(0, 19).replace('T', ' ');
        const endStr = endDate.toISOString().slice(0, 19).replace('T', ' ');

        const kpis = await DashboardModel.getKPIs(startStr, endStr) || {};
        const ordersByStatus = await DashboardModel.getOrdersByStatus(startStr, endStr);
        const salesByCategory = await DashboardModel.getSalesByCategory(startStr, endStr);
        const topCustomers = await DashboardModel.getTopCustomers(startStr, endStr);
        const topProducts = await DashboardModel.getTopProducts(startStr, endStr);
        const paymentMethods = await DashboardModel.getPaymentMethods(startStr, endStr);
        const couponPerformance = await DashboardModel.getCouponPerformance(startStr, endStr);
        const returnStats = await DashboardModel.getReturns(startStr, endStr);

        // Defensive numeric parsing to avoid runtime errors when DB returns unexpected values
        const safeKpis = {
            revenue: Number(kpis.revenue || 0),
            orders: Number(kpis.orders || 0),
            products: Number(kpis.products || 0),
            customers: Number(kpis.customers || 0)
        };

        const safeReturnStats = {
            total: Number(returnStats?.total || 0),
            returned: Number(returnStats?.returned || 0),
            refundedAmount: Number(returnStats?.refundedAmount || 0),
            avgResolutionSeconds: Number(returnStats?.avgResolutionSeconds || 0)
        };

        // Calculate Return Rate
        const returnRate = safeReturnStats.total > 0
            ? ((safeReturnStats.returned / safeReturnStats.total) * 100).toFixed(1)
            : "0.0";

        // Format for frontend
        return {
            kpis: [
                { title: "Revenue", value: `₹${safeKpis.revenue.toLocaleString('en-IN')}`, icon: "BarChart3" },
                { title: "Orders", value: safeKpis.orders.toString(), icon: "ShoppingCart" },
                { title: "Products", value: safeKpis.products.toString(), icon: "Package" },
                { title: "Customers", value: safeKpis.customers.toString(), icon: "Users" }
            ],
            ordersByStatus: ordersByStatus.map(s => ({
                label: s.status.charAt(0).toUpperCase() + s.status.slice(1),
                value: s.count,
                color: this.getStatusColor(s.status)
            })),
            salesByCategory,
            topCustomers,
            topProducts,
            paymentMethods: paymentMethods.map(p => ({
                icon: "CreditCard",
                name: p.name || 'Unknown',
                value: safeKpis.orders > 0 ? Math.round((Number(p.value || 0) / safeKpis.orders) * 100) : 0
            })),
            coupons: couponPerformance,
            returns: [
                { label: "Return Rate", value: `${returnRate}%` },
                { 
                    label: "Avg. Resolution Time", 
                    value: safeReturnStats.avgResolutionSeconds > 0 
                        ? `${(safeReturnStats.avgResolutionSeconds / 86400).toFixed(1)} days` 
                        : "N/A" 
                },
                    { label: "Refunded Amount", value: `₹${safeReturnStats.refundedAmount.toLocaleString('en-IN')}` }
            ]
        };
    }

    static async getDashboardOverview() {
        const recentOrders = await DashboardModel.getRecentOrders();
        const lowStockProducts = await DashboardModel.getLowStockProducts();

        // Reuse getStats logic for 30 days default
        const stats = await this.getStats('30');

        return {
            stats: stats.kpis,
            recentOrders: recentOrders.map(o => ({
                ...o,
                date: this.timeAgo(new Date(o.created_at))
            })),
            topProducts: stats.topProducts,
            lowStockProducts
        };
    }

    static getStatusColor(status) {
        const colors = {
            pending: '#FF7E00',
            processing: '#8B6F47',
            shipped: '#2D5F3F',
            delivered: '#2D5F3F',
            cancelled: '#DC2626'
        };
        return colors[status] || '#000000';
    }

    static timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }
}

module.exports = DashboardService;
