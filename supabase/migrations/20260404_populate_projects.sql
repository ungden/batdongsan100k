-- Add RLS policies for projects insert/update
DO $$ BEGIN
  CREATE POLICY "allow_insert_projects" ON projects FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "allow_update_projects" ON projects FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Populate new projects
WITH known_projects(pname) AS (
  VALUES
    ('Moonlight'),('Lavita'),('The EverRich'),('Prosper'),('Cantavil'),('One Verandah'),
    ('City Gate'),('Happy Valley'),('Dragon Hill'),('Green Valley'),('Mường Thanh'),
    ('Vinpearl'),('The Panorama'),('Riviera Point'),('Saigon Gateway'),('Grand Riverside'),
    ('Q7 Saigon Riverside'),('Saigon South'),('The Ascent'),('De Capella'),('Cộng Hòa Garden'),
    ('Phú Hoàng Anh'),('The Art'),('Hùng Vương Plaza'),('The Prince Residence'),
    ('The Park Residence'),('The Western Capital'),('Hoàng Anh Thanh Bình'),
    ('Ocean Vista'),('Monarchy'),('Ciputra'),('Ngoại Giao Đoàn'),
    ('Gateway Thảo Điền'),('Vista Verde'),('The Vista'),('The Nassim'),
    ('Sunshine Riverside'),('Khang Điền'),('An Gia Riverside'),('Hausneo'),('La Astoria'),
    ('Saigon Intela'),('Riverside Residence'),('Hưng Phúc'),('Happy Residence'),('Lucasta'),
    ('Blooming Tower'),('Azura'),('Fhome'),('The Sang Residence'),('Hiyori'),
    ('Gold Coast'),('Scenia Bay'),('Nha Trang Center'),
    ('NovaWorld Phan Thiết'),('Starlake'),('Vạn Phúc City'),('The Zen'),
    ('D''Edge Thảo Điền'),('Luxcity'),('Millennium')
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
  avg_area = EXCLUDED.avg_area, city = EXCLUDED.city, district = EXCLUDED.district,
  updated_at = now();

-- Update cover images for new projects
UPDATE projects SET cover_image = sub.img FROM (
  SELECT DISTINCT ON (proj.id) proj.id AS proj_id, p.images[1] AS img
  FROM projects proj
  JOIN properties p ON lower(p.title || ' ' || coalesce(p.address, '')) LIKE '%' || lower(proj.name) || '%'
  WHERE p.status = 'published' AND p.images IS NOT NULL AND array_length(p.images, 1) > 0
  ORDER BY proj.id, p.is_featured DESC, p.created_at DESC
) sub WHERE projects.id = sub.proj_id AND projects.cover_image IS NULL;

-- Link properties to new projects
UPDATE properties SET project_id = sub.proj_id FROM (
  SELECT p.id AS prop_id, proj.id AS proj_id
  FROM properties p
  JOIN projects proj ON lower(p.title || ' ' || coalesce(p.address, '')) LIKE '%' || lower(proj.name) || '%'
  WHERE p.status = 'published' AND p.project_id IS NULL
) sub WHERE properties.id = sub.prop_id;
