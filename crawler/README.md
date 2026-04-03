# SangNhuongVIP - Hướng dẫn Crawl Data

## Tổng quan
Crawler lấy data bất động sản từ Chotot/Nhatot public API, transform và insert vào Supabase.

## Yêu cầu
- Node.js >= 18
- npm dependencies: `@supabase/supabase-js`
- Supabase project đã có bảng `listings` và RPC function `submit_listing`

## Luồng crawl (3 bước)

### Bước 1: Crawl data từ API → JSON file

```bash
cd crawler
npm install
node crawl-real.mjs
```

**File:** `crawl-real.mjs`

**Nguồn:** Chotot/Nhatot public API
- Endpoint: `https://gateway.chotot.com/v1/public/ad-listing`
- Params: `cg` (category), `region_v2` (vùng), `limit`, `o` (offset), `st` (type: s=bán, k=thuê)

**Categories (`cg`):**
| Code | Loại |
|------|------|
| 1010 | Căn hộ/Chung cư |
| 1020 | Nhà ở |
| 1030 | Đất nền |
| 1040 | Văn phòng/Mặt bằng |
| 1050 | Phòng trọ |
| 1060 | Kho/Nhà xưởng |

**Regions (`region_v2`):**
| Code | Thành phố | Số trang nên crawl |
|------|-----------|-------------------|
| 13000 | TP.HCM | 6 |
| 12000 | Hà Nội | 6 |
| 51000 | Đà Nẵng | 3 |
| 43000 | Cần Thơ | 2 |
| 15000 | Hải Phòng | 2 |
| 48000 | Bình Dương | 3 |
| 49000 | Đồng Nai | 2 |
| 46000 | Khánh Hòa | 2 |
| 50000 | Bà Rịa Vũng Tàu | 2 |

**Output:** `listings-real.json` - array of listings, mỗi item có:
```json
{
  "title": "Tiêu đề tin (từ ad.subject)",
  "description": "Mô tả (từ ad.body)",
  "price": 5500000000,
  "address": "Đường X, Phường Y, Quận Z",
  "district": "Quận Z",
  "city": "TP.HCM",
  "category": "Nhà ở",
  "area": 68,
  "images": ["https://cdn.chotot.com/...jpg", "..."],
  "contact_name": "Tên thật người đăng (từ ad.account_name)",
  "contact_phone": "SĐT thật (từ ad.phone hoặc random nếu ko có)",
  "is_verified": false,
  "is_vip": false,
  "rent_price": 35000000,
  "transaction_type": "sang-nhuong"
}
```

**Lưu ý:**
- Delay 500-800ms giữa mỗi request để không bị block
- Dedup theo title (skip nếu trùng)
- Chỉ lấy listings có ảnh (skip nếu images rỗng)
- Giữ NGUYÊN tên người đăng và SĐT - KHÔNG random thay thế

### Bước 2: Insert vào Supabase

```bash
node do-insert-rpc.mjs
```

**File:** `do-insert-rpc.mjs`

**Cách hoạt động:**
- Đọc `listings-real.json`
- Gọi Supabase RPC function `bulk_insert_listing` cho mỗi listing
- Function có `SECURITY DEFINER` để bypass RLS
- Status mặc định: `approved` (data crawl được auto-approve)
- `created_at` random trong 15 ngày gần nhất

**Trước khi chạy, tạo RPC function:**
```sql
CREATE OR REPLACE FUNCTION public.bulk_insert_listing(
  p_user_id uuid,
  p_title text,
  p_description text,
  p_price bigint,
  p_address text,
  p_district text,
  p_city text,
  p_province text,
  p_category text,
  p_area int,
  p_images text[],
  p_is_verified boolean,
  p_is_vip boolean,
  p_contact_name text,
  p_contact_phone text,
  p_rent_price bigint,
  p_transaction_type text,
  p_views int
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO listings (user_id, title, description, price, address, district, city, province, category, area, images, status, is_verified, is_vip, contact_name, contact_phone, rent_price, transaction_type, views, created_at, updated_at)
  VALUES (p_user_id, p_title, p_description, p_price, p_address, p_district, p_city, p_province, p_category, p_area, p_images, 'approved', p_is_verified, p_is_vip, p_contact_name, p_contact_phone, p_rent_price, p_transaction_type, p_views, NOW() - (random() * 15)::int * interval '1 day', NOW());
END;
$$;
GRANT EXECUTE ON FUNCTION public.bulk_insert_listing TO anon;
```

**Sau khi xong, xóa function:**
```sql
DROP FUNCTION IF EXISTS public.bulk_insert_listing;
```

### Bước 3: Kiểm tra data quality

```sql
-- Tổng listings
SELECT count(*) FROM listings;

-- Check contact info đầy đủ
SELECT count(*) FILTER (WHERE contact_name IS NOT NULL AND length(contact_name) > 1) as has_name,
       count(*) FILTER (WHERE contact_phone IS NOT NULL AND length(contact_phone) >= 10) as has_phone,
       count(*) FILTER (WHERE array_length(images, 1) > 0) as has_images
FROM listings;

-- Xóa listings fake (nếu có)
DELETE FROM listings WHERE contact_name IN ('', 'Chủ nhà') OR contact_name IS NULL;
DELETE FROM listings WHERE images[1] LIKE '%example.com%' OR images[1] LIKE '%placehold%';
```

## Cấu hình Supabase

```
URL: https://rzbmyosdlhhrqdfwgmyk.supabase.co
Anon Key: (xem .env.local)
Admin User ID: 6ff8caa1-d08e-442a-8a53-9e743316fb59
```

## Data flow song song

```
[Chotot API] → crawl-real.mjs → listings-real.json → do-insert-rpc.mjs → Supabase (status: approved)
                                                                              ↓
[User đăng tin] → /post form → submit_listing RPC → Supabase (status: pending)
                                                         ↓
                                              [Admin duyệt] → /admin/listings → approved
```

## Chạy định kỳ

Để refresh data mới, chạy lại Bước 1-2. Crawler sẽ dedup theo title nên không tạo duplicate.

Recommend: chạy 1 lần/tuần hoặc khi cần thêm data mới.

## Troubleshooting

| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| 403 từ API | Rate limited | Tăng delay lên 1000-2000ms |
| RLS block insert | Anon key không có quyền | Tạo RPC function với SECURITY DEFINER |
| invalid integer | area có số thập phân | Math.round(area) trước khi insert |
| Ảnh không load | CDN hotlink block | Ảnh Chotot CDN thường OK, nếu block thì download về Supabase Storage |
