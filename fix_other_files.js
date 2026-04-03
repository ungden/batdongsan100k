const fs = require('fs');

const files = [
  'mobile/app/(tabs)/search.tsx',
  'mobile/app/(tabs)/post.tsx',
  'mobile/app/my-listings.tsx',
  'mobile/app/upgrade/[id].tsx',
  'mobile/app/(tabs)/favorites.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace table names
    content = content.replace(/\.from\('listings'\)/g, ".from('properties')");
    
    // Replace 'approved' with 'published' where appropriate (mostly in search and my-listings)
    content = content.replace(/\.eq\('status', 'approved'\)/g, ".eq('status', 'published')");
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
