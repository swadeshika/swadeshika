const Razorpay = require('razorpay');
const crypto = require('crypto');
const AdminSettingsService = require('./adminSettingsService');

class PaymentService {
    static async getRazorpayInstance() {
        const settings = await AdminSettingsService.getSettings();
        const razorpayConfig = settings.gateway_configs?.razorpay;

        if (!razorpayConfig || !razorpayConfig.apiKey || !razorpayConfig.apiSecret) {
            throw new Error('Razorpay is not configured properly in Admin Settings');
        }

        return new Razorpay({
            key_id: razorpayConfig.apiKey,
            key_secret: razorpayConfig.apiSecret
        });
    }

    /**
     * Create a Razorpay Order
     * @param {number} amount Amount in INR
     * @param {string} receipt Receipt ID (e.g. internal order number)
     */
    static async createOrder(amount, receipt) {
        try {
            const instance = await this.getRazorpayInstance();
            const options = {
                amount: Math.round(amount * 100), // Razorpay accepts amount in paise
                currency: "INR",
                receipt: receipt,
                payment_capture: 1 // Auto capture
            };
            
            const order = await instance.orders.create(options);
            return order;
        } catch (error) {
            console.error('Razorpay Create Order Error:', error);
            throw error;
        }
    }

    /**
     * Verify Razorpay Payment Signature
     * @param {string} razorpayOrderId 
     * @param {string} razorpayPaymentId 
     * @param {string} razorpaySignature 
     */
    static async verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        try {
            const settings = await AdminSettingsService.getSettings();
            const secret = settings.gateway_configs?.razorpay?.apiSecret;

            if (!secret) {
                throw new Error('Razorpay secret not found');
            }

            const body = razorpayOrderId + "|" + razorpayPaymentId;
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(body.toString())
                .digest('hex');

            return expectedSignature === razorpaySignature;
        } catch (error) {
            console.error('Razorpay Signature Verification Error:', error);
            return false;
        }
    }
}

module.exports = PaymentService;
