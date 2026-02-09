const db = require('../src/config/db');

async function fixBlogContentEscaping() {
  try {
    // console.log('Connecting to database...');
    
    // Fetch all posts that seem to have escaped HTML (starting with &lt;)
    const [posts] = await db.query("SELECT id, title, content FROM blog_posts WHERE content LIKE '%&lt;%'");
    
    // console.log(`Found ${posts.length} posts with potentially escaped content.`);

    for (const post of posts) {
      // console.log(`Fixing post ID: ${post.id} - ${post.title}`);
      
      let newContent = post.content;
      
      // Multi-pass unescape just in case
      // Replace common HTML entities
      const replacements = {
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&amp;': '&', // Do amp last to avoid double decoding issues if they exist
        '&nbsp;': ' '
      };

      // Simple replace all implementation
      for (const [entity, char] of Object.entries(replacements)) {
        newContent = newContent.split(entity).join(char);
      }
      
      // Update in DB
      await db.query('UPDATE blog_posts SET content = ? WHERE id = ?', [newContent, post.id]);
      // console.log(`✅ Updated post ${post.id}`);
    }

    // console.log('All posts processed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixBlogContentEscaping();
