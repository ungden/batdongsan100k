const fs = require('fs');
const file = 'mobile/app/(tabs)/search.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const { data } = await query.order('created_at', { ascending: false }).limit(20);",
  "const { data } = await query.order('priority_level', { ascending: false }).order('sort_date', { ascending: false }).limit(20);"
);

fs.writeFileSync(file, content);
console.log('Patched search.tsx');
