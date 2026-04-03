const fs = require('fs');
const path = './lib/data.ts';
let code = fs.readFileSync(path, 'utf8');

// Replace objects in MOCK_PROPERTIES array that are missing the fields
code = code.replace(/createdAt: '([^']+)',/g, "createdAt: '$1',\n    updatedAt: '$1',\n    status: 'published',\n    authorId: 'system',");

fs.writeFileSync(path, code);
