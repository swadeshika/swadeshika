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
        // Check if this is the first address for THIS phone number, if so make it default
        const count = await AddressModel.countByUserIdAndPhone(userId, data.phone);
        const is_default = count === 0 ? true : (data.is_default || false);

        const address = await AddressModel.create({
            user_id: userId,
            ...data,
            is_default // Override with calculated default
        });

        // Use the model's setDefault logic which now handles scoping by phone
        if (is_default && count > 0) {
            await AddressModel.setDefault(userId, address.id);
        }

        // Refetch to ensure we return the correct state (e.g. is_default might be true now)
        return await AddressModel.findById(address.id);
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
        
        // Check total addresses for this user
        const allAddresses = await AddressModel.findByUserId(userId);
        
        // Prevent deletion of last address
        if (allAddresses.length === 1) {
            throw { 
                statusCode: 400, 
                message: 'Cannot delete your only address. You must have at least one address.' 
            };
        }
        
        // If deleting the default address, set another as default
        if (address.is_default && allAddresses.length > 1) {
            // Find first non-deleted address that isn't the current one
            const nextDefault = allAddresses.find(addr => addr.id !== id);
            if (nextDefault) {
                await AddressModel.setDefault(userId, nextDefault.id);
            }
        }
        
        // Delete the address
        await AddressModel.delete(id);
        
        // If only one address left, make it default automatically
        const remainingAddresses = await AddressModel.findByUserId(userId);
        if (remainingAddresses.length === 1) {
            await AddressModel.setDefault(userId, remainingAddresses[0].id);
        }
    }
}

module.exports = AddressService;
