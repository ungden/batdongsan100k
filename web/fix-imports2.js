const fs = require('fs');
const file = './src/app/(public)/listings/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('import ListingViewToggle from "@/components/ListingViewToggle";\n', '');
content = content.replace('<ListingViewToggle properties={properties} />', '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">\n              {properties.map((property) => (\n                <PropertyCard key={property.id} property={property} />\n              ))}\n            </div>');
fs.writeFileSync(file, content);
