require('dotenv').config();
const db = require('../src/config/db');
const AddressModel = require('../src/models/addressModel');
const { v4: uuidv4 } = require('uuid');

async function testPhoneScopedDefaults() {
    try {
        console.log('Starting Phone-Scoped Default Test...');

        // 1. Create a dummy user
        const userId = uuidv4();
        console.log(`Created dummy user: ${userId}`);

        // Helper to delay
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        // 2. Create Address A (Phone 1) -> is_default = true
        console.log('\n--- Creating Address A (Phone 1, Default) ---');
        const addrA = await AddressModel.create({
            user_id: userId,
            full_name: 'User A',
            phone: '1111111111',
            address_line1: 'Line 1',
            city: 'City',
            state: 'State',
            postal_code: '123456',
            is_default: true
        });
        console.log('Address A created:', addrA.id, 'Default:', addrA.is_default);

        // 3. Create Address B (Phone 2) -> is_default = true
        // NOTE: In current implementation (before fix), this might Unset A.
        // We simulate the service logic: Create then set default if true.
        console.log('\n--- Creating Address B (Phone 2, Default) ---');
        const addrB = await AddressModel.create({
            user_id: userId,
            full_name: 'User B',
            phone: '2222222222',
            address_line1: 'Line 2',
            city: 'City',
            state: 'State',
            postal_code: '123456',
            is_default: false // create as false first, simulate service flow if needed, OR model handles it?
            // actually AddressModel.create usage in Service takes 'is_default' calculated.
            // But Service calls setDefault separately if count > 0.
            // Let's assume we call setDefault explicitly to test THAT function.
        });
        await AddressModel.setDefault(userId, addrB.id);
        console.log('Address B set as default.');

        // 4. Check status of A and B
        const check1 = await AddressModel.findByUserId(userId);
        const aStatus = check1.find(a => a.id === addrA.id);
        const bStatus = check1.find(a => a.id === addrB.id);
        console.log(`\nCheck 1:`);
        console.log(`Address A (Phone 1) Default: ${aStatus.is_default}`);
        console.log(`Address B (Phone 2) Default: ${bStatus.is_default}`);

        if (aStatus.is_default === 0 && bStatus.is_default === 1) {
            console.log('CURRENT BEHAVIOR: Address B overtook Address A (Global Default).');
        } else if (aStatus.is_default === 1 && bStatus.is_default === 1) {
            console.log('DESIRED BEHAVIOR: Both are default (Different phones).');
        }

        // 5. Create Address C (Phone 1) -> Set Default
        console.log('\n--- Creating Address C (Phone 1, Default) ---');
        const addrC = await AddressModel.create({
            user_id: userId,
            full_name: 'User C',
            phone: '1111111111',
            address_line1: 'Line 3',
            city: 'City',
            state: 'State',
            postal_code: '123456',
            is_default: false
        });
        await AddressModel.setDefault(userId, addrC.id);

        // 6. Check status of A, B, C
        const check2 = await AddressModel.findByUserId(userId);
        const aStatus2 = check2.find(a => a.id === addrA.id);
        const bStatus2 = check2.find(a => a.id === addrB.id);
        const cStatus2 = check2.find(a => a.id === addrC.id);

        console.log(`\nCheck 2:`);
        console.log(`Address A (Phone 1) Default: ${aStatus2.is_default}`);
        console.log(`Address B (Phone 2) Default: ${bStatus2.is_default}`);
        console.log(`Address C (Phone 1) Default: ${cStatus2.is_default}`);

        // Clean up
        await db.query('DELETE FROM addresses WHERE user_id = ?', [userId]);
        console.log('\nCleanup done.');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testPhoneScopedDefaults();
