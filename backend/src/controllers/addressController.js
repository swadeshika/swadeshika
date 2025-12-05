const AddressService = require('../services/addressService');

/**
 * Address Controller
 * Handles incoming requests for address operations
 */
class AddressController {
    /**
     * Get all addresses for the logged-in user
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async getAddresses(req, res, next) {
        try {
            const addresses = await AddressService.getUserAddresses(req.user.id);
            // Map back to frontend keys if needed?
            // Frontend expects camelCase. DB is snake_case.
            // Let's map it for consistency with frontend expectations.
            const mapped = addresses.map(addr => ({
                id: addr.id,
                name: addr.full_name,
                phone: addr.phone,
                addressLine1: addr.address_line1,
                addressLine2: addr.address_line2,
                city: addr.city,
                state: addr.state,
                postalCode: addr.postal_code,
                country: addr.country,
                addressType: addr.address_type,
                isDefault: Boolean(addr.is_default)
            }));
            
            res.json({ success: true, data: mapped });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new address
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async createAddress(req, res, next) {
        try {
            // Map frontend keys to DB keys
            const {
                name, phone, addressLine1, addressLine2, city, state, postalCode, country, addressType, isDefault
            } = req.body;

            const dbData = {
                full_name: name,
                phone,
                address_line1: addressLine1,
                address_line2: addressLine2,
                city,
                state,
                postal_code: postalCode,
                country,
                address_type: addressType,
                is_default: isDefault
            };

            const newAddress = await AddressService.createAddress(req.user.id, dbData);
            
            // Return mapped response
            res.status(201).json({
                success: true,
                message: 'Address added successfully',
                data: {
                    id: newAddress.id,
                    name: newAddress.full_name,
                    phone: newAddress.phone,
                    addressLine1: newAddress.address_line1,
                    addressLine2: newAddress.address_line2,
                    city: newAddress.city,
                    state: newAddress.state,
                    postalCode: newAddress.postal_code,
                    country: newAddress.country,
                    addressType: newAddress.address_type,
                    isDefault: Boolean(newAddress.is_default)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update an address
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async updateAddress(req, res, next) {
        try {
            const { id } = req.params;
            const {
                name, phone, addressLine1, addressLine2, city, state, postalCode, country, addressType, isDefault
            } = req.body;

            const dbData = {};
            if (name) dbData.full_name = name;
            if (phone) dbData.phone = phone;
            if (addressLine1) dbData.address_line1 = addressLine1;
            if (addressLine2 !== undefined) dbData.address_line2 = addressLine2;
            if (city) dbData.city = city;
            if (state) dbData.state = state;
            if (postalCode) dbData.postal_code = postalCode;
            if (country) dbData.country = country;
            if (addressType) dbData.address_type = addressType;
            if (isDefault !== undefined) dbData.is_default = isDefault;

            const updatedAddress = await AddressService.updateAddress(id, req.user.id, dbData);

            res.json({
                success: true,
                message: 'Address updated successfully',
                data: {
                    id: updatedAddress.id,
                    name: updatedAddress.full_name,
                    phone: updatedAddress.phone,
                    addressLine1: updatedAddress.address_line1,
                    addressLine2: updatedAddress.address_line2,
                    city: updatedAddress.city,
                    state: updatedAddress.state,
                    postalCode: updatedAddress.postal_code,
                    country: updatedAddress.country,
                    addressType: updatedAddress.address_type,
                    isDefault: Boolean(updatedAddress.is_default)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete an address
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async deleteAddress(req, res, next) {
        try {
            const { id } = req.params;
            await AddressService.deleteAddress(id, req.user.id);
            res.json({ success: true, message: 'Address deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AddressController;
