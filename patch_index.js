const fs = require('fs');
const file = 'mobile/app/(tabs)/index.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "priorityLevel: dbItem.is_priority ? 1 : 0,",
  "priorityLevel: dbItem.priority_level || (dbItem.is_priority ? 1 : 0),"
);

content = content.replace(
  "sortDate: dbItem.created_at || new Date().toISOString(),",
  "sortDate: dbItem.sort_date || dbItem.created_at || new Date().toISOString(),"
);

fs.writeFileSync(file, content);
console.log('Patched index.tsx');
