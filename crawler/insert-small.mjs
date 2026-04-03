import { readFileSync, writeFileSync } from "fs";

const listings = JSON.parse(readFileSync("listings.json", "utf-8"));
const ADMIN_ID = "6ff8caa1-d08e-442a-8a53-9e743316fb59";
const BATCH_SIZE = 10; // small batches

function escapeSQL(str) {
  if (str === null || str === undefined) return "NULL";
  return "'" + String(str).replace(/'/g, "''").replace(/\\/g, "\\\\").substring(0, 500) + "'";
}

function buildInsert(batch) {
  const values = batch.map((l) => {
    // Only use first 3 images to keep SQL size small
    const imgs = l.images.slice(0, 3);
    const imgArr = imgs.length > 0
      ? `ARRAY[${imgs.map((i) => escapeSQL(i)).join(",")}]::text[]`
      : "'{}'::text[]";
    const desc = l.description ? escapeSQL(l.description.substring(0, 300)) : "NULL";
    return `('${ADMIN_ID}',${escapeSQL(l.title.substring(0, 200))},${desc},${l.price},${escapeSQL(l.address)},${escapeSQL(l.district)},${escapeSQL(l.city)},${escapeSQL(l.province)},${escapeSQL(l.category)},${l.area || "NULL"},${imgArr},'approved',${l.is_verified},${l.is_vip},${escapeSQL(l.contact_name)},${escapeSQL(l.contact_phone)},${l.rent_price || "NULL"},NULL,${escapeSQL(l.transaction_type)},${l.views},NOW()-interval '${Math.floor(Math.random()*15)} days',NOW())`;
  });

  return `INSERT INTO listings (user_id,title,description,price,address,district,city,province,category,area,images,status,is_verified,is_vip,contact_name,contact_phone,rent_price,revenue,transaction_type,views,created_at,updated_at) VALUES ${values.join(",")};`;
}

const batches = [];
for (let i = 0; i < listings.length; i += BATCH_SIZE) {
  const batch = listings.slice(i, i + BATCH_SIZE);
  batches.push(buildInsert(batch));
}

writeFileSync("batches.json", JSON.stringify(batches));
console.log(`Generated ${batches.length} batches for ${listings.length} listings`);
console.log(`Avg batch size: ${Math.round(batches.reduce((s,b) => s + b.length, 0) / batches.length)} chars`);
