const AdminModel = require('../models/adminModel');
const UserModel = require('../models/userModel');

class AuthService {
    /**
     * Change Password
     * ---------------
     * Delegates to AdminModel or UserModel based on role.
     */
    static async changePassword(id, role, oldPassword, newPassword) {
        if (role === 'admin') {
            return await AdminModel.updatePassword(id, oldPassword, newPassword);
        } else {
            return await UserModel.updatePassword(id, oldPassword, newPassword);
        }
    }
}

module.exports = AuthService;
