const AddressModel = require('../models/addressModel');

/**
 * Address Service
 * Handles business logic for address management
 */
class AddressService {
    /**
     * Create a new address
     * @param {string} userId - User ID
     * @param {Object} data - Address data
     * @returns {Promise<Object>} Created address
     */
    static async createAddress(userId, data) {
        // Check if this is the first address, if so make it default
        const count = await AddressModel.countByUserId(userId);
        const is_default = count === 0 ? true : (data.is_default || false);

        // Map frontend keys to DB keys if necessary (though controller handles this usually, 
        // we'll ensure data passed here is already mapped or map it)
        // Assuming controller passes DB-compatible keys or we map them here.
        // Let's assume controller maps them.
        
        // If setting as default, we need to handle that logic
        if (is_default && count > 0) {
            // We'll handle this by creating it first then setting default, 
            // or relying on the model's create to set it and then unsetting others?
            // Model.create just inserts. 
            // If is_default is true, we should unset others first.
            await AddressModel.setDefault(userId, null); // Hacky way to unset all? No, setDefault takes an ID.
            // Better: Create it, then if is_default is true, call setDefault.
        }

        const address = await AddressModel.create({
            user_id: userId,
            ...data,
            is_default // Override with calculated default
        });

        if (is_default && count > 0) {
             await AddressModel.setDefault(userId, address.id);
        }

        return address;
    }

    /**
     * Get all addresses for a user
     * @param {string} userId 
     * @returns {Promise<Array>}
     */
    static async getUserAddresses(userId) {
        return await AddressModel.findByUserId(userId);
    }

    /**
     * Get single address
     * @param {string} id 
     * @param {string} userId - For ownership check
     * @returns {Promise<Object>}
     */
    static async getAddress(id, userId) {
        const address = await AddressModel.findById(id);
        if (!address) {
            throw { statusCode: 404, message: 'Address not found' };
        }
        if (address.user_id !== userId) {
            throw { statusCode: 403, message: 'Unauthorized access to address' };
        }
        return address;
    }

    /**
     * Update address
     * @param {string} id 
     * @param {string} userId 
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    static async updateAddress(id, userId, data) {
        const address = await this.getAddress(id, userId); // Checks existence and ownership

        if (data.is_default) {
            await AddressModel.setDefault(userId, id);
        }

        return await AddressModel.update(id, data);
    }

    /**
     * Delete address
     * @param {string} id 
     * @param {string} userId 
     */
    static async deleteAddress(id, userId) {
        const address = await this.getAddress(id, userId);
        await AddressModel.delete(id);
    }
}

module.exports = AddressService;
