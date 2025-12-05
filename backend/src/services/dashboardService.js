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

        const kpis = await DashboardModel.getKPIs(startStr, endStr);
        const ordersByStatus = await DashboardModel.getOrdersByStatus(startStr, endStr);
        const salesByCategory = await DashboardModel.getSalesByCategory(startStr, endStr);
        const topCustomers = await DashboardModel.getTopCustomers(startStr, endStr);
        const topProducts = await DashboardModel.getTopProducts(startStr, endStr);

        // Format for frontend
        return {
            kpis: [
                { title: "Revenue", value: `₹${kpis.revenue.toLocaleString('en-IN')}`, icon: "BarChart3" },
                { title: "Orders", value: kpis.orders.toString(), icon: "ShoppingCart" },
                { title: "Products", value: kpis.products.toString(), icon: "Package" },
                { title: "Customers", value: kpis.customers.toString(), icon: "Users" }
            ],
            ordersByStatus: ordersByStatus.map(s => ({
                label: s.status.charAt(0).toUpperCase() + s.status.slice(1),
                value: s.count,
                color: this.getStatusColor(s.status)
            })),
            salesByCategory,
            topCustomers,
            topProducts
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
