const fs = require('fs');
const path = require('path');

// Files to DELETE (test/debug/one-time scripts)
const filesToDelete = [
    'test-blog-creation-auth.js',
    'test-create-blog.js',
    'test-contact-crud.js',
    'test-model-load.js',
    'test-sql-syntax.js',
    'test-upload.txt',
    'check-schema.js',
    'check-users.js',
    'check-bad-users.js',
    'check_categories.js',
    'cleanup-bad-users.js',
    'fix-blog-authors.js',
    'fix-blog-schema.js',
    'verify-blog-fix.js',
    'verify-phone-defaults-fixed.js',
    'verify-settings.js',
    'verify_categories_api.js',
    'verify_products.js',
    'update-contact-schema.js',
    'update_settings_schema.js',
    'create-missing-tables.js',
    'drop-homepage-tables.js',
    'audit-results.txt',
    'debug_category_create.js',
    'debug_product_save.js',
    'reproduce-default-issue.js',
    'simple-test.js',
    'create_contact_table.js',
    'ensure_admin_tables.js',
    'CLEANUP_ANALYSIS.md'
];

// Files to KEEP (useful for production/maintenance)
const filesToKeep = [
    'audit-database.js',      // Database schema auditing
    'create_admin.js',        // Create admin user
    'init-settings.js',       // Initialize settings
    'seedProducts.js',        // Seed product data
    'seed_categories.js'      // Seed category data
];

console.log('='.repeat(60));
console.log('SCRIPTS CLEANUP');
console.log('='.repeat(60));

console.log('\n📁 Files to KEEP:');
filesToKeep.forEach(f => console.log(`  ✅ ${f}`));

console.log('\n🗑️  Files to DELETE:');
let deletedCount = 0;
let notFoundCount = 0;

filesToDelete.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`  ❌ Deleted: ${file}`);
            deletedCount++;
        } catch (error) {
            console.log(`  ⚠️  Failed to delete: ${file} - ${error.message}`);
        }
    } else {
        console.log(`  ⚪ Not found: ${file}`);
        notFoundCount++;
    }
});

console.log('\n' + '='.repeat(60));
console.log('CLEANUP SUMMARY');
console.log('='.repeat(60));
console.log(`Files kept: ${filesToKeep.length}`);
console.log(`Files deleted: ${deletedCount}`);
console.log(`Files not found: ${notFoundCount}`);
console.log('='.repeat(60));
console.log('\n✅ Cleanup complete! Scripts folder is now clean.');
