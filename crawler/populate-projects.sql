-- Populate projects table from properties data
-- Run this after adding new project names to KNOWN_PROJECTS
-- Can be re-run safely (uses ON CONFLICT DO UPDATE)

-- Step 1: Insert/update projects with computed stats
WITH known_projects(pname) AS (
  VALUES
    -- HCM - Vinhomes
    ('Vinhomes Grand Park'), ('Vinhomes Central Park'), ('Vinhomes Golden River'), ('Vinhomes Ba Son'),
    -- HCM - Masteri
    ('Masteri Thảo Điền'), ('Masteri Centre Point'), ('Masteri An Phú'), ('Masteri Millennium'),
    -- HCM - Sunrise
    ('Sunrise City'), ('Sunrise Riverside'),
    -- HCM - Phú Mỹ Hưng
    ('Phú Mỹ Hưng'), ('Midtown'), ('Scenic Valley'), ('Happy Valley'), ('Happy Residence'),
    ('Green Valley'), ('Hưng Phúc'), ('The Panorama'), ('Riverside Residence'),
    ('Sky Garden'), ('River Park'),
    -- HCM - Q2/Thủ Đức
    ('Diamond Island'), ('Feliz En Vista'), ('The Ascent'), ('The Estella'),
    ('Estella Heights'), ('Lexington Residence'), ('The Sun Avenue'), ('Cantavil'),
    ('Sala'), ('One Verandah'), ('Palm Heights'), ('Gem Riverside'),
    ('Lakeview City'), ('The Nassim'), ('Gateway Thảo Điền'), ('Vista Verde'),
    -- HCM - Q7
    ('Saigon South'), ('Dragon Hill'), ('Riviera Point'),
    ('Q7 Saigon Riverside'), ('Eco Green'), ('Jamona'), ('Era Town'),
    ('The Park Residence'), ('Hoàng Anh Thanh Bình'),
    -- HCM - Q1/3/4/5
    ('Saigon Pearl'), ('Saigon Royal'), ('Landmark 81'), ('The Marq'),
    ('Sunwah Pearl'), ('River Gate'), ('The EverRich'), ('Kingston Residence'),
    ('The Tresor'), ('Grand Riverside'), ('De Capella'),
    ('Ha Do Centrosa'), ('Xi Riverview'), ('Xi Grand Court'),
    ('The Prince Residence'), ('Hùng Vương Plaza'),
    -- HCM - Bình Thạnh/Gò Vấp/Tân Bình/Tân Phú
    ('Botanica'), ('The Gold View'), ('Centana'), ('Richstar'),
    ('Celadon City'), ('Moonlight'), ('Dream Home'), ('Green Town'),
    ('Tara Residence'), ('Orchard Garden'), ('Orchard Parkview'),
    ('Cộng Hòa Garden'), ('Galaxy'), ('City Gate'),
    ('Prosper'), ('Saigon Gateway'), ('The Western Capital'),
    ('Phú Hoàng Anh'), ('The Art'),
    -- Bình Dương
    ('The Habitat'), ('Lavita'), ('Tecco'),
    -- Đồng Nai
    ('Aqua City'), ('Verosa Park'), ('The Rivus'), ('DIC Phoenix'),
    -- HCM khác
    ('Topaz Home'), ('Topaz Elite'),
    ('Mizuki Park'), ('Akari City'), ('Safira'), ('Hausneo'), ('La Astoria'),
    ('Empire City'), ('Sola Park'), ('Lumiere Riverside'),
    ('An Gia Riverside'), ('Saigon Intela'),
    -- Hà Nội
    ('Vinhomes Smart City'), ('Vinhomes Ocean Park'), ('Vinhomes Riverside'),
    ('Vinhomes Metropolis'), ('Vinhomes West Point'), ('Vinhomes Skylake'),
    ('Royal City'), ('Times City'), ('Goldmark City'),
    ('Imperia Sky Garden'), ('Sunshine City'), ('Sunshine Riverside'),
    ('The Zen'), ('Tây Hồ Tây'), ('Ngoại Giao Đoàn'),
    ('Ecopark Grand'), ('The Manor'),
    ('Ciputra'), ('Starlake'), ('Vạn Phúc City'),
    -- Đà Nẵng
    ('Monarchy'), ('Blooming Tower'), ('Azura'), ('Fhome'),
    ('The Sang Residence'), ('Hiyori'), ('Sun Cosmo'),
    ('Premier Sky Residences'), ('Indochina Riverside'),
    -- Nha Trang
    ('The Costa Nha Trang'), ('Mường Thanh'), ('Vinpearl'),
    ('Gold Coast'), ('Scenia Bay'), ('Ocean Gate'),
    ('Nha Trang Center'),
    -- Bình Thuận / Vũng Tàu
    ('Ocean Vista'), ('Melody Vũng Tàu'), ('NovaWorld Phan Thiết'),
    ('Aria Vũng Tàu'),
    -- Chủ đầu tư lớn
    ('Novaland'), ('Khang Điền'), ('Nam Long'),
    ('Hưng Lộc Phát'), ('Đất Xanh'), ('Phát Đạt')
),
stats AS (
  SELECT
    kp.pname,
    count(*) AS cnt,
    min(p.price) FILTER (WHERE p.price > 0) AS min_p,
    max(p.price) FILTER (WHERE p.price > 0) AS max_p,
    avg(p.price) FILTER (WHERE p.price > 0) AS avg_p,
    avg(p.price / NULLIF(p.area, 0)) FILTER (WHERE p.area > 0 AND p.price > 0) AS avg_psqm,
    avg(p.area) FILTER (WHERE p.area > 0) AS avg_a,
    mode() WITHIN GROUP (ORDER BY p.city) AS top_city,
    mode() WITHIN GROUP (ORDER BY p.district) AS top_district
  FROM known_projects kp
  JOIN properties p ON lower(p.title || ' ' || coalesce(p.address, '')) LIKE '%' || lower(kp.pname) || '%'
  WHERE p.status = 'published'
  GROUP BY kp.pname
  HAVING count(*) >= 3
)
INSERT INTO projects (name, slug, city, district, property_count, min_price, max_price, avg_price, avg_price_per_sqm, avg_area, status)
SELECT
  s.pname,
  lower(regexp_replace(regexp_replace(regexp_replace(normalize(s.pname, NFD), '[\u0300-\u036f]', '', 'g'), 'đ', 'd', 'gi'), '[^a-z0-9]+', '-', 'gi')),
  s.top_city, s.top_district,
  s.cnt, coalesce(s.min_p, 0), coalesce(s.max_p, 0), coalesce(s.avg_p, 0),
  coalesce(s.avg_psqm, 0), coalesce(s.avg_a, 0), 'selling'
FROM stats s
ON CONFLICT (slug) DO UPDATE SET
  property_count = EXCLUDED.property_count,
  min_price = EXCLUDED.min_price, max_price = EXCLUDED.max_price,
  avg_price = EXCLUDED.avg_price, avg_price_per_sqm = EXCLUDED.avg_price_per_sqm,
  avg_area = EXCLUDED.avg_area,
  city = EXCLUDED.city, district = EXCLUDED.district,
  updated_at = now();

-- Step 2: Update cover images
UPDATE projects SET cover_image = sub.img FROM (
  SELECT DISTINCT ON (proj.id) proj.id AS proj_id, p.images[1] AS img
  FROM projects proj
  JOIN properties p ON lower(p.title || ' ' || coalesce(p.address, '')) LIKE '%' || lower(proj.name) || '%'
  WHERE p.status = 'published' AND p.images IS NOT NULL AND array_length(p.images, 1) > 0
  ORDER BY proj.id, p.is_featured DESC, p.created_at DESC
) sub WHERE projects.id = sub.proj_id AND projects.cover_image IS NULL;

-- Step 3: Update properties.project_id for new matches
UPDATE properties SET project_id = sub.proj_id FROM (
  SELECT p.id AS prop_id, proj.id AS proj_id
  FROM properties p
  JOIN projects proj ON lower(p.title || ' ' || coalesce(p.address, '')) LIKE '%' || lower(proj.name) || '%'
  WHERE p.status = 'published' AND p.project_id IS NULL
) sub WHERE properties.id = sub.prop_id;
