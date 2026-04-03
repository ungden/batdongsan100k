const fs = require('fs');
let code = fs.readFileSync('web/src/lib/queries/properties.ts', 'utf8');

// Find the index of the FIRST correct getProjectListingsBySlug
let goodIndex = code.indexOf('export async function getProjectListingsBySlug(slug: string, limit = 12): Promise<Property[]> {');

// Find the end of this good block
let nextIndex = code.indexOf('    return matchingItems.slice(0, limit).map(mapToProperty)', goodIndex);
let endOfGoodBlock = code.indexOf('}', nextIndex) + 1; // closes try
endOfGoodBlock = code.indexOf('}', endOfGoodBlock) + 1; // closes catch
endOfGoodBlock = code.indexOf('}', endOfGoodBlock) + 1; // closes function

// Keep everything up to the end of the good block
code = code.substring(0, endOfGoodBlock);

fs.writeFileSync('web/src/lib/queries/properties.ts', code);
