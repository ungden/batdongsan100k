const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'mobile/app/(tabs)/index.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `    agent: {
      id: dbItem.agent_id || 'system',
      name: 'Admin',
      phone: '0901234567',
      email: 'contact@titanhome.vn',
      avatar: 'https://i.pravatar.cc/150?u=system',
    },`;

const replacement = `    agent: {
      id: dbItem.profiles?.id || dbItem.agent_id || 'system',
      name: dbItem.profiles?.full_name || dbItem.profiles?.name || 'Admin',
      phone: dbItem.profiles?.phone || '0901234567',
      email: dbItem.profiles?.email || 'contact@titanhome.vn',
      avatar: dbItem.profiles?.avatar_url || dbItem.profiles?.avatar || 'https://i.pravatar.cc/150?u=system',
    },`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed agent mapping in index.tsx');
} else {
  console.log('Target not found in index.tsx');
}
