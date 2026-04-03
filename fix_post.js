const fs = require('fs');

const file = 'mobile/app/(tabs)/post.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldInsert = `const insertData = {
        user_id: user.id,
        title,
        description: description.trim(),
        price: parseFloat(price) * 1000000000, // Assuming input in Tỷ
        area: parseFloat(area),
        address,
        category: typeOption?.value === 'chung-cu' ? 'apartment' : 'house',
        transaction_type: 'mua-ban', // default to sale for now
        status: 'pending', // Requires admin approval
        features: selectedAmenities, // Assuming jsonb or array column
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'], // Placeholder
        contact_name: user.user_metadata?.full_name || user.email,
      };`;

const newInsert = `const insertData = {
        created_by: user.id,
        agent_id: user.id,
        title,
        description: description.trim(),
        price: parseFloat(price) * 1000000000, // Assuming input in Tỷ
        price_unit: 'tỷ',
        price_formatted: price,
        area: parseFloat(area),
        address,
        type: typeOption?.value || 'nha-pho',
        category: 'sale', // 'sale' instead of 'mua-ban'
        status: 'draft', // 'draft' instead of 'pending' based on types
        features: selectedAmenities,
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'], // Placeholder
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      };`;

content = content.replace(oldInsert, newInsert);
fs.writeFileSync(file, content);
console.log('Fixed post.tsx');
