const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
