import { readFileSync, writeFileSync } from "fs";

const listings = JSON.parse(readFileSync("listings-real.json", "utf-8"));
const ADMIN_ID = "6ff8caa1-d08e-442a-8a53-9e743316fb59";
const BATCH_SIZE = 5; // very small to keep SQL under limits

function esc(str) {
  if (str === null || str === undefined) return "NULL";
  return "'" + String(str).replace(/'/g, "''").substring(0, 500) + "'";
}

function buildInsert(batch) {
  const values = batch.map((l) => {
    const imgs = l.images.slice(0, 4);
    const imgArr = imgs.length > 0
      ? `ARRAY[${imgs.map((i) => esc(i)).join(",")}]::text[]`
      : "'{}'::text[]";
    const desc = l.description ? esc(l.description.substring(0, 300)) : "NULL";
    const days = Math.floor(Math.random() * 15);
    const hrs = Math.floor(Math.random() * 24);
    return `('${ADMIN_ID}',${esc(l.title.substring(0, 200))},${desc},${l.price},${esc(l.address)},${esc(l.district)},${esc(l.city)},${esc(l.province)},${esc(l.category)},${l.area || "NULL"},${imgArr},'approved',${l.is_verified},${l.is_vip},${esc(l.contact_name)},${esc(l.contact_phone)},${l.rent_price || "NULL"},NULL,${esc(l.transaction_type)},${l.views},NOW()-interval '${days} days ${hrs} hours',NOW())`;
  });

  return `INSERT INTO listings (user_id,title,description,price,address,district,city,province,category,area,images,status,is_verified,is_vip,contact_name,contact_phone,rent_price,revenue,transaction_type,views,created_at,updated_at) VALUES ${values.join(",")};`;
}

const batches = [];
for (let i = 0; i < listings.length; i += BATCH_SIZE) {
  batches.push(buildInsert(listings.slice(i, i + BATCH_SIZE)));
}

writeFileSync("real-batches.json", JSON.stringify(batches));
console.log(`Generated ${batches.length} batches for ${listings.length} listings`);
console.log(`Avg size: ${Math.round(batches.reduce((s, b) => s + b.length, 0) / batches.length)} chars`);
console.log(`Max size: ${Math.max(...batches.map((b) => b.length))} chars`);
