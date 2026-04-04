-- Upgrade projects table with rich project information fields

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS price_range TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS price_per_sqm BIGINT DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS launch_price BIGINT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS current_price BIGINT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS completion_date TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS legal_status TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS handover_standard TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS total_units INT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS sold_units INT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS floors INT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS blocks INT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS apartment_types TEXT[] DEFAULT '{}';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS total_area_ha NUMERIC;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS rental_yield NUMERIC;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Seed project information for major projects
-- Data sourced from public real estate listings

UPDATE public.projects SET
  developer = 'Vingroup', total_units = 43000, floors = 30, blocks = 81,
  apartment_types = ARRAY['Studio','1PN','2PN','3PN','Shophouse'],
  completion_date = '2023', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cơ bản',
  total_area_ha = 271, price_range = '1.5 - 8 tỷ',
  description = 'Đại đô thị Vinhomes Grand Park tại TP. Thủ Đức với công viên 36ha, trung tâm thương mại Vincom, trường học Vinschool và bệnh viện Vinmec.',
  badges = ARRAY['hot','featured']
WHERE slug = 'vinhomes-grand-park';

UPDATE public.projects SET
  developer = 'Vingroup', total_units = 45000, floors = 35, blocks = 66,
  apartment_types = ARRAY['Studio','1PN','2PN','3PN','Penthouse'],
  completion_date = '2024', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cao cấp',
  total_area_ha = 280, price_range = '3 - 6 tỷ',
  description = 'Đại đô thị thông minh Vinhomes Smart City tại Nam Từ Liêm, Hà Nội. Ứng dụng công nghệ smart home, công viên trung tâm 10ha.',
  badges = ARRAY['hot','featured']
WHERE slug = 'vinhomes-smart-city';

UPDATE public.projects SET
  developer = 'Vingroup', total_units = 36000, floors = 25, blocks = 58,
  apartment_types = ARRAY['Studio','1PN','2PN','3PN'],
  completion_date = '2022', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cơ bản',
  total_area_ha = 420, price_range = '2.5 - 5 tỷ',
  description = 'Đại đô thị Vinhomes Ocean Park tại Gia Lâm, Hà Nội với biển hồ nước mặn nhân tạo 6.1ha và hệ thống tiện ích Vingroup.',
  badges = ARRAY['hot','featured']
WHERE slug = 'vinhomes-ocean-park';

UPDATE public.projects SET
  developer = 'Vingroup', total_units = 10000, floors = 40, blocks = 6,
  apartment_types = ARRAY['1PN','2PN','3PN','4PN','Penthouse'],
  completion_date = '2018', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cao cấp',
  total_area_ha = 47, price_range = '3.5 - 12 tỷ',
  description = 'Khu đô thị cao cấp Vinhomes Central Park tại Bình Thạnh, TP.HCM. Tích hợp Landmark 81 - tòa nhà cao nhất Việt Nam.',
  badges = ARRAY['featured']
WHERE slug = 'vinhomes-central-park';

UPDATE public.projects SET
  developer = 'Vingroup', total_units = 4000, floors = 50, blocks = 4,
  apartment_types = ARRAY['1PN','2PN','3PN','Penthouse','Duplex'],
  completion_date = '2019', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cao cấp',
  total_area_ha = 25, price_range = '5 - 20 tỷ',
  description = 'Khu đô thị hạng sang Vinhomes Golden River (Ba Son) tại Quận 1, TP.HCM. View trực diện sông Sài Gòn.',
  badges = ARRAY['featured']
WHERE slug = 'vinhomes-golden-river';

UPDATE public.projects SET
  developer = 'Gamuda Land', total_units = 9400, floors = 33, blocks = 8,
  apartment_types = ARRAY['1PN','2PN','3PN','Duplex','Shophouse'],
  completion_date = '2025', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cơ bản',
  total_area_ha = 82, price_range = '2.5 - 4.5 tỷ',
  description = 'Khu đô thị xanh Celadon City tại Tân Phú, TP.HCM. Quy hoạch theo tiêu chuẩn xanh với công viên trung tâm 16ha.',
  badges = ARRAY['hot']
WHERE slug = 'celadon-city';

UPDATE public.projects SET
  developer = 'Masterise Homes', total_units = 3000, floors = 40, blocks = 2,
  apartment_types = ARRAY['1PN','2PN','3PN','Penthouse'],
  completion_date = '2017', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cao cấp',
  total_area_ha = 7, price_range = '4 - 10 tỷ', rental_yield = 5.5,
  description = 'Dự án căn hộ cao cấp Masteri Thảo Điền tại Quận 2 (Thủ Đức), TP.HCM. Nội thất cao cấp, view sông Sài Gòn.',
  badges = ARRAY['featured']
WHERE slug = 'masteri-thao-dien';

UPDATE public.projects SET
  developer = 'Novaland', total_units = 2800, floors = 30, blocks = 3,
  apartment_types = ARRAY['1PN','2PN','3PN'],
  completion_date = '2019', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cơ bản',
  total_area_ha = 4, price_range = '3 - 6 tỷ', rental_yield = 5.0,
  description = 'Dự án Sunrise City tại Quận 7, TP.HCM. Tích hợp trung tâm thương mại, gần cầu Phú Mỹ.',
  badges = ARRAY['featured']
WHERE slug = 'sunrise-city';

UPDATE public.projects SET
  developer = 'Phú Mỹ Hưng', total_units = 5000, floors = 25, blocks = 6,
  apartment_types = ARRAY['2PN','3PN','4PN','Penthouse','Biệt thự'],
  completion_date = '2020', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cao cấp',
  total_area_ha = 12, price_range = '5 - 20 tỷ', rental_yield = 4.0,
  description = 'Khu đô thị Phú Mỹ Hưng Midtown tại Quận 7, TP.HCM. Mật độ xây dựng thấp, nhiều không gian mở và công viên.',
  badges = ARRAY['featured']
WHERE slug = 'midtown';

UPDATE public.projects SET
  developer = 'Nam Long Group', total_units = 8500, floors = 25, blocks = 14,
  apartment_types = ARRAY['1PN','2PN','3PN','Shophouse'],
  completion_date = '2024', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cơ bản',
  total_area_ha = 26, price_range = '2.5 - 4 tỷ',
  description = 'Khu đô thị Mizuki Park tại Bình Chánh, TP.HCM. Thiết kế phong cách Nhật Bản với kênh đào và công viên bờ sông.',
  badges = ARRAY['new']
WHERE slug = 'mizuki-park';

UPDATE public.projects SET
  developer = 'Kusto Home', total_units = 1500, floors = 35, blocks = 2,
  apartment_types = ARRAY['2PN','3PN','4PN','Penthouse'],
  completion_date = '2018', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cao cấp',
  total_area_ha = 3, price_range = '6 - 15 tỷ', rental_yield = 5.0,
  description = 'Diamond Island (Đảo Kim Cương) tại Quận 2, TP.HCM. Dự án đẳng cấp trên đảo nhân tạo giữa sông Sài Gòn.',
  badges = ARRAY['featured']
WHERE slug = 'diamond-island';

UPDATE public.projects SET
  developer = 'CapitaLand', total_units = 1400, floors = 38, blocks = 2,
  apartment_types = ARRAY['1PN','2PN','3PN'],
  completion_date = '2019', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cao cấp',
  total_area_ha = 2, price_range = '4 - 8 tỷ', rental_yield = 5.5,
  description = 'Feliz En Vista tại Quận 2, TP.HCM. Thiết kế bởi kiến trúc sư nổi tiếng, view panorama sông Sài Gòn.',
  badges = ARRAY['featured']
WHERE slug = 'feliz-en-vista';

UPDATE public.projects SET
  developer = 'Hưng Thịnh Corp', total_units = 2000, floors = 28, blocks = 3,
  apartment_types = ARRAY['1PN','2PN','3PN'],
  completion_date = '2021', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cơ bản',
  total_area_ha = 5, price_range = '2.5 - 4 tỷ',
  description = 'Richstar tại Tân Phú, TP.HCM. Khu phức hợp căn hộ tích hợp trung tâm thương mại Novaland.',
  badges = ARRAY['hot']
WHERE slug = 'richstar';

UPDATE public.projects SET
  developer = 'Vingroup', total_units = 3000, floors = 45, blocks = 3,
  apartment_types = ARRAY['1PN','2PN','3PN','Penthouse'],
  completion_date = '2020', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cao cấp',
  total_area_ha = 8, price_range = '4 - 12 tỷ',
  description = 'Vinhomes Metropolis tại Ba Đình, Hà Nội. Dự án hạng sang tại trung tâm thủ đô với thiết kế kiến trúc Pháp.',
  badges = ARRAY['featured']
WHERE slug = 'vinhomes-metropolis';

UPDATE public.projects SET
  developer = 'Vinhomes', total_units = 12000, floors = 35, blocks = 15,
  apartment_types = ARRAY['Studio','1PN','2PN','3PN'],
  completion_date = '2019', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cơ bản',
  total_area_ha = 32, price_range = '3.5 - 7 tỷ',
  description = 'Royal City tại Thanh Xuân, Hà Nội. Trung tâm thương mại ngầm lớn nhất Đông Nam Á, sân trượt băng, rạp chiếu phim.',
  badges = ARRAY['featured']
WHERE slug = 'royal-city';

UPDATE public.projects SET
  developer = 'Vingroup', total_units = 15000, floors = 40, blocks = 18,
  apartment_types = ARRAY['1PN','2PN','3PN','4PN'],
  completion_date = '2016', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cơ bản',
  total_area_ha = 36, price_range = '3.5 - 8 tỷ',
  description = 'Times City tại Hai Bà Trưng, Hà Nội. Khu đô thị khép kín với Vincom Mega Mall, Vinschool, Vinmec.',
  badges = ARRAY['featured']
WHERE slug = 'times-city';

UPDATE public.projects SET
  developer = 'TNR Holdings', total_units = 5000, floors = 32, blocks = 4,
  apartment_types = ARRAY['2PN','3PN','4PN'],
  completion_date = '2018', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cơ bản',
  total_area_ha = 10, price_range = '2.5 - 5 tỷ',
  description = 'Goldmark City tại Bắc Từ Liêm, Hà Nội. Dự án với hơn 5000 căn hộ và hệ thống tiện ích nội khu phong phú.',
  badges = ARRAY['hot']
WHERE slug = 'goldmark-city';

UPDATE public.projects SET
  developer = 'Keppel Land', total_units = 1200, floors = 40, blocks = 2,
  apartment_types = ARRAY['1PN','2PN','3PN','Penthouse'],
  completion_date = '2019', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cao cấp',
  total_area_ha = 2, price_range = '3.5 - 7 tỷ', rental_yield = 6.0,
  description = 'Empire City tại Thủ Đức, TP.HCM. Tổ hợp căn hộ - văn phòng cao cấp với view trực diện sông Sài Gòn.',
  badges = ARRAY['featured']
WHERE slug = 'empire-city';

UPDATE public.projects SET
  developer = 'Novaland', total_units = 800, floors = 30, blocks = 2,
  apartment_types = ARRAY['1PN','2PN','3PN'],
  completion_date = '2020', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cơ bản',
  total_area_ha = 2, price_range = '3 - 6 tỷ', rental_yield = 5.0,
  description = 'The Sun Avenue tại Quận 2, TP.HCM. Kết nối trực tiếp tuyến Metro số 1, gần khu công nghệ cao.',
  badges = ARRAY['featured']
WHERE slug = 'the-sun-avenue';

UPDATE public.projects SET
  developer = 'Phú Mỹ Hưng', total_units = 3000, floors = 20, blocks = 8,
  apartment_types = ARRAY['2PN','3PN','4PN','Biệt thự'],
  completion_date = '2005-nay', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cao cấp',
  total_area_ha = 600, price_range = '5 - 50 tỷ',
  description = 'Khu đô thị kiểu mẫu Phú Mỹ Hưng tại Quận 7, TP.HCM. Quy hoạch đồng bộ theo tiêu chuẩn quốc tế.',
  badges = ARRAY['featured']
WHERE slug = 'phu-my-hung';

UPDATE public.projects SET
  developer = 'SonKim Land', total_units = 1000, floors = 50, blocks = 2,
  apartment_types = ARRAY['1PN','2PN','3PN','Penthouse'],
  completion_date = '2018', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cao cấp',
  total_area_ha = 3, price_range = '5 - 15 tỷ', rental_yield = 4.5,
  description = 'The Nassim tại Thảo Điền, Quận 2 (Thủ Đức). Dự án siêu sang với mật độ xây dựng cực thấp.',
  badges = ARRAY['featured']
WHERE slug = 'the-nassim';

UPDATE public.projects SET
  developer = 'Novaland', total_units = 600, floors = 35, blocks = 1,
  apartment_types = ARRAY['2PN','3PN','Penthouse'],
  completion_date = '2020', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cao cấp',
  total_area_ha = 1.5, price_range = '4 - 8 tỷ', rental_yield = 5.0,
  description = 'The Tresor tại Quận 4, TP.HCM. View trực diện sông Sài Gòn và Bitexco Financial Tower.',
  badges = ARRAY['featured']
WHERE slug = 'the-tresor';

UPDATE public.projects SET
  developer = 'Sunshine Group', total_units = 8000, floors = 35, blocks = 12,
  apartment_types = ARRAY['1PN','2PN','3PN','Penthouse'],
  completion_date = '2023', legal_status = 'Sổ hồng', handover_standard = 'Hoàn thiện cao cấp',
  total_area_ha = 15, price_range = '3 - 7 tỷ',
  description = 'Sunshine City tại Nam Từ Liêm, Hà Nội. Dự án ứng dụng smart home 4.0 toàn diện.',
  badges = ARRAY['hot']
WHERE slug = 'sunshine-city';

UPDATE public.projects SET
  developer = 'Novaland', total_units = 10000, total_area_ha = 1000,
  apartment_types = ARRAY['Biệt thự','Nhà phố','Shophouse','Căn hộ'],
  completion_date = '2025-2030', legal_status = 'Sổ hồng',
  price_range = '5 - 30 tỷ',
  description = 'Siêu dự án nghỉ dưỡng NovaWorld Phan Thiết tại Bình Thuận. Tích hợp sân golf, công viên giải trí, bãi biển riêng.',
  badges = ARRAY['hot','new']
WHERE slug IN ('novaworld-phan-thiet');

-- Set default badges for projects without specific info
UPDATE public.projects SET badges = ARRAY['hot']
WHERE property_count >= 20 AND (badges IS NULL OR array_length(badges, 1) IS NULL);

UPDATE public.projects SET badges = ARRAY['new']
WHERE property_count >= 10 AND property_count < 20 AND (badges IS NULL OR array_length(badges, 1) IS NULL);
