const db = require('../src/config/db');

async function fixBlogImages() {
  try {
    // Check current state
    const [posts] = await db.query('SELECT id, title, featured_image FROM blog_posts');
    console.log('\n=== Current Blog Posts ===');
    posts.forEach(p => {
      console.log(`ID: ${p.id}, Title: ${p.title}, Image: ${p.featured_image || 'NULL'}`);
    });

    // Set empty strings to NULL
    const [result] = await db.query(`
      UPDATE blog_posts 
      SET featured_image = NULL 
      WHERE featured_image = '' OR LENGTH(TRIM(COALESCE(featured_image, ''))) = 0
    `);
    console.log(`\n✅ Updated ${result.affectedRows} posts with empty images to NULL`);

    // Check authors
    const [authors] = await db.query('SELECT id, name, avatar FROM blog_authors');
    console.log('\n=== Blog Authors ===');
    authors.forEach(a => {
      console.log(`ID: ${a.id}, Name: ${a.name}, Avatar: ${a.avatar || 'NULL'}`);
    });

    // Set empty author avatars to NULL
    const [authorResult] = await db.query(`
      UPDATE blog_authors 
      SET avatar = NULL 
      WHERE avatar = '' OR LENGTH(TRIM(COALESCE(avatar, ''))) = 0
    `);
    console.log(`\n✅ Updated ${authorResult.affectedRows} authors with empty avatars to NULL`);

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixBlogImages();
