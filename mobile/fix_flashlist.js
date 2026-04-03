const fs = require('fs');
const files = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/search.tsx',
  'app/(tabs)/favorites.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/(\s+)(estimatedItemSize=\{[0-9]+\})/g, "$1// @ts-expect-error TS missing type$1$2");
  fs.writeFileSync(file, content);
});
