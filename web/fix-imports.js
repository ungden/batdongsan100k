const fs = require('fs');
const file = './src/app/(public)/listings/page.tsx';
let content = fs.readFileSync(file, 'utf8');
if (!content.includes('import ListingViewToggle')) {
  content = content.replace('import PropertyCard from "@/components/PropertyCard";', 'import PropertyCard from "@/components/PropertyCard";\nimport ListingViewToggle from "@/components/ListingViewToggle";');
  fs.writeFileSync(file, content);
}
