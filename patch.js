const fs = require('fs');

const path = 'mobile/app/(tabs)/index.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update queries in fetchProperties
content = content.replace(
  /\.order\('created_at', \{ ascending: false \}\)/g,
  ".order('priority_level', { ascending: false, nullsFirst: false })\n          .order('sort_date', { ascending: false, nullsFirst: false })"
);

content = content.replace(
  /\.order\('views', \{ ascending: false \}\)/g,
  ".order('priority_level', { ascending: false, nullsFirst: false })\n          .order('sort_date', { ascending: false, nullsFirst: false })"
);

// Update mapSupabaseListingToProperty
content = content.replace(
  /isFeatured: dbItem\.is_vip \|\| false,/,
  "isFeatured: dbItem.is_vip || false,\n    priorityLevel: dbItem.priority_level || 0,\n    sortDate: dbItem.sort_date || dbItem.created_at || new Date().toISOString(),"
);

fs.writeFileSync(path, content, 'utf8');
