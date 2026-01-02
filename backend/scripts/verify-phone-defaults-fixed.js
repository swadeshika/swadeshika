require('dotenv').config();
const db = require('../src/config/db');
const AddressModel = require('../src/models/addressModel');
const AddressService = require('../src/services/addressService');
const { v4: uuidv4 } = require('uuid');

async function testPhoneScopedDefaults() {
    try {
        console.log('Starting Verification for Phone-Scoped Defaults...');

        const userId = uuidv4();
        console.log(`Created dummy user: ${userId}`);

        // 1. Create Address A (Phone 1) -> Should be Default (First one)
        console.log('\n--- 1. Creating Address A (Phone 1) ---');
        const addrA = await AddressService.createAddress(userId, {
            full_name: 'User A',
            phone: '111',
            address_line1: 'Line 1',
            city: 'City',
            state: 'State',
            postal_code: '123456',
            country: 'India',
            address_type: 'home'
        });
        console.log(`Address A created. Default: ${addrA.is_default}`);
        if (!addrA.is_default) throw new Error('Address A should be default (first for phone 1)');

        // 2. Create Address B (Phone 1) -> Should NOT be Default (Second one)
        console.log('\n--- 2. Creating Address B (Phone 1) ---');
        const addrB = await AddressService.createAddress(userId, {
            full_name: 'User B',
            phone: '111',
            address_line1: 'Line 2',
            city: 'City',
            state: 'State',
            postal_code: '123456',
            country: 'India',
            address_type: 'work'
        });
        console.log(`Address B created. Default: ${addrB.is_default}`);
        if (addrB.is_default) throw new Error('Address B should NOT be default automatically');

        // 3. Create Address C (Phone 2) -> Should be Default (First for Phone 2)
        console.log('\n--- 3. Creating Address C (Phone 2) ---');
        const addrC = await AddressService.createAddress(userId, {
            full_name: 'User C',
            phone: '222',
            address_line1: 'Line 3',
            city: 'City',
            state: 'State',
            postal_code: '123456',
            country: 'India',
            address_type: 'home'
        });
        console.log(`Address C created. Default: ${addrC.is_default}`);
        if (!addrC.is_default) throw new Error('Address C should be default (first for phone 2)');

        // Check A is still default
        const A_fresh = await AddressModel.findById(addrA.id);
        console.log(`Address A (Phone 1) Default Status: ${A_fresh.is_default}`);
        if (!A_fresh.is_default) throw new Error('Address A should still be default for Phone 1');

        // 4. Set Address B (Phone 1) as Default
        console.log('\n--- 4. Setting Address B (Phone 1) as Default ---');
        await AddressService.updateAddress(addrB.id, userId, { is_default: true });

        // Verify:
        // A -> should be False
        // B -> should be True
        // C -> should be True (Phone 2 unaffected)
        const check = await AddressModel.findByUserId(userId);
        const aStatus = check.find(a => a.id === addrA.id);
        const bStatus = check.find(a => a.id === addrB.id);
        const cStatus = check.find(a => a.id === addrC.id);

        console.log(`A (111): ${aStatus.is_default}`);
        console.log(`B (111): ${bStatus.is_default}`);
        console.log(`C (222): ${cStatus.is_default}`);

        if (aStatus.is_default) throw new Error('A should NOT be default');
        if (!bStatus.is_default) throw new Error('B SHOULD be default');
        if (!cStatus.is_default) throw new Error('C SHOULD be default');

        console.log('\n✅ VERIFICATION SUCCESSFUL!');

        // Cleanup
        await db.query('DELETE FROM addresses WHERE user_id = ?', [userId]);
        process.exit(0);

    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    }
}

testPhoneScopedDefaults();
