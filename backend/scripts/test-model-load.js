
try {
    const UserModel = require('../src/models/userModel');
    console.log('UserModel loaded successfully');
} catch (error) {
    console.error('Failed to load UserModel:', error);
}
