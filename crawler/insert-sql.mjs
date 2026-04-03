import { readFileSync, writeFileSync } from "fs";

const listings = JSON.parse(readFileSync("listings.json", "utf-8"));
const ADMIN_ID = "6ff8caa1-d08e-442a-8a53-9e743316fb59";
const BATCH_SIZE = 50;

function escapeSQL(str) {
  if (str === null || str === undefined) return "NULL";
  return "'" + String(str).replace(/'/g, "''").replace(/\\/g, "\\\\") + "'";
}

function buildInsert(batch) {
  const values = batch.map((l) => {
    const imgs = `ARRAY[${l.images.map((i) => escapeSQL(i)).join(",")}]::text[]`;
    return `(
      '${ADMIN_ID}',
      ${escapeSQL(l.title)},
      ${escapeSQL(l.description)},
      ${l.price},
      ${escapeSQL(l.address)},
      ${escapeSQL(l.district)},
      ${escapeSQL(l.city)},
      ${escapeSQL(l.province)},
      ${escapeSQL(l.category)},
      ${l.area || "NULL"},
      ${imgs},
      ${escapeSQL(l.status)},
      ${l.is_verified},
      ${l.is_vip},
      ${escapeSQL(l.contact_name)},
      ${escapeSQL(l.contact_phone)},
      ${l.rent_price || "NULL"},
      NULL,
      ${escapeSQL(l.transaction_type)},
      ${l.views},
      NOW() - interval '${Math.floor(Math.random() * 15)} days' - interval '${Math.floor(Math.random() * 24)} hours',
      NOW()
    )`;
  });

  return `INSERT INTO listings (user_id, title, description, price, address, district, city, province, category, area, images, status, is_verified, is_vip, contact_name, contact_phone, rent_price, revenue, transaction_type, views, created_at, updated_at) VALUES ${values.join(",\n")};`;
}

// Generate batch SQL files
const batches = [];
for (let i = 0; i < listings.length; i += BATCH_SIZE) {
  const batch = listings.slice(i, i + BATCH_SIZE);
  const sql = buildInsert(batch);
  const filename = `batch_${Math.floor(i / BATCH_SIZE)}.sql`;
  writeFileSync(filename, sql);
  batches.push(filename);
}

console.log(`Generated ${batches.length} batch files for ${listings.length} listings`);
