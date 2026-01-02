const { pool } = require('../src/config/db');
const fs = require('fs');

async function auditDatabase() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('='.repeat(60));
        log('DATABASE SCHEMA AUDIT');
        log('='.repeat(60));

        // Get all tables from database
        const [tables] = await pool.query('SHOW TABLES');
        const dbTables = tables.map(row => Object.values(row)[0]).sort();

        log('\n📊 Tables in Database: ' + dbTables.length);
        dbTables.forEach((table, i) => log(`  ${i + 1}. ${table}`));

        // Read migration file
        const migrationContent = fs.readFileSync('./database_migration.sql', 'utf8');
        
        // Extract table names from CREATE TABLE statements
        const createTableRegex = /CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/gi;
        const matches = [...migrationContent.matchAll(createTableRegex)];
        const migrationTables = [...new Set(matches.map(m => m[1]))].sort();

        log('\n📄 Tables in Migration File: ' + migrationTables.length);
        migrationTables.forEach((table, i) => log(`  ${i + 1}. ${table}`));

        // Find missing tables
        const missingInDb = migrationTables.filter(t => !dbTables.includes(t));
        const missingInMigration = dbTables.filter(t => !migrationTables.includes(t));

        log('\n' + '='.repeat(60));
        log('AUDIT RESULTS');
        log('='.repeat(60));

        if (missingInDb.length > 0) {
            log('\n❌ Tables in Migration but NOT in Database:');
            missingInDb.forEach(t => log(`  - ${t}`));
        } else {
            log('\n✅ All migration tables exist in database');
        }

        if (missingInMigration.length > 0) {
            log('\n⚠️  Tables in Database but NOT in Migration:');
            missingInMigration.forEach(t => log(`  - ${t}`));
        } else {
            log('\n✅ All database tables documented in migration');
        }

        log('\n' + '='.repeat(60));
        log('SUMMARY');
        log('='.repeat(60));
        log(`Total Database Tables: ${dbTables.length}`);
        log(`Total Migration Tables: ${migrationTables.length}`);
        log(`Missing in DB: ${missingInDb.length}`);
        log(`Missing in Migration: ${missingInMigration.length}`);
        log('='.repeat(60));

        // Write to file
        fs.writeFileSync('./scripts/audit-results.txt', output);
        log('\n✅ Results saved to scripts/audit-results.txt');

    } catch (error) {
        log('Error: ' + error.message);
    } finally {
        await pool.end();
    }
}

auditDatabase();
