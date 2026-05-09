-- Seed catalyst events for top projects.
-- Curated from public infrastructure/legal/economic news.
-- Will be expanded automatically by crawler/catalyst-crawl.mjs (Phase 6).

-- Helper: insert catalysts by project slug (skip silently if project doesn't exist)
CREATE OR REPLACE FUNCTION pg_temp.insert_catalyst(
  p_slug TEXT,
  p_title TEXT,
  p_category TEXT,
  p_impact TEXT,
  p_horizon TEXT,
  p_status TEXT,
  p_expected_date DATE,
  p_description TEXT
) RETURNS VOID AS $$
DECLARE
  pid UUID;
BEGIN
  SELECT id INTO pid FROM public.projects WHERE slug = p_slug;
  IF pid IS NULL THEN RETURN; END IF;
  INSERT INTO public.project_catalysts (project_id, title, category, impact, status, horizon, expected_date, description)
  VALUES (pid, p_title, p_category, p_impact, p_status, p_horizon, p_expected_date, p_description)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Vinhomes Grand Park (TP. Thủ Đức)
SELECT pg_temp.insert_catalyst('vinhomes-grand-park', 'Metro số 1 (Bến Thành – Suối Tiên) vận hành thương mại',  'infrastructure', 'high',   'short',  'confirmed', '2026-12-31', 'Tuyến metro chính thức chạy thương mại, kết nối GP với trung tâm');
SELECT pg_temp.insert_catalyst('vinhomes-grand-park', 'Vành đai 3 đoạn TP. Thủ Đức hoàn thành',                   'infrastructure', 'high',   'medium', 'confirmed', '2027-06-30', 'Hoàn thiện kết nối liên vùng TP.HCM – Bình Dương – Đồng Nai');
SELECT pg_temp.insert_catalyst('vinhomes-grand-park', 'Tăng lấp đầy cư dân ~80.000 người',                         'economic',       'medium', 'long',   'speculative','2028-12-31', 'Dân cư về đông kéo theo dịch vụ, thương mại, giá thuê tăng');

-- Vinhomes Smart City (Hà Nội)
SELECT pg_temp.insert_catalyst('vinhomes-smart-city', 'Vành đai 4 vùng Thủ đô khởi công các đoạn quan trọng',     'infrastructure', 'high',   'medium', 'confirmed', '2027-06-30', 'Hạ tầng cấp vùng cải thiện kết nối Smart City');
SELECT pg_temp.insert_catalyst('vinhomes-smart-city', 'Mega Mall Vincom Smart City mở rộng giai đoạn 2',          'commercial',     'medium', 'short',  'confirmed', '2026-12-31', 'Tăng tiện ích và sức hút khu vực');
SELECT pg_temp.insert_catalyst('vinhomes-smart-city', 'Tuyến đường sắt đô thị số 5 Văn Cao – Hòa Lạc',            'infrastructure', 'high',   'long',   'speculative','2030-12-31', 'Kết nối trục Tây Hà Nội qua Smart City');

-- Vinhomes Ocean Park (Gia Lâm)
SELECT pg_temp.insert_catalyst('vinhomes-ocean-park', 'Gia Lâm chính thức lên quận', 'legal', 'high', 'short', 'confirmed', '2026-12-31', 'Nâng cấp hành chính từ huyện lên quận, kích giá đất');
SELECT pg_temp.insert_catalyst('vinhomes-ocean-park', 'Tuyến metro số 8 Sơn Đồng – Dương Xá', 'infrastructure', 'medium', 'long', 'speculative', '2030-12-31', 'Cải thiện kết nối Đông Hà Nội');

-- Celadon City (Tân Phú)
SELECT pg_temp.insert_catalyst('celadon-city', 'Aeon Mall Tân Phú nâng cấp quy mô', 'commercial', 'medium', 'short', 'confirmed', '2026-06-30', 'Trung tâm thương mại sát dự án nâng cấp');
SELECT pg_temp.insert_catalyst('celadon-city', 'Hoàn thành mở rộng đường Lũy Bán Bích', 'infrastructure', 'medium', 'short', 'confirmed', '2026-12-31', 'Giảm ùn tắc, tăng giá trị khu vực Tân Phú');

-- Mizuki Park (Bình Chánh)
SELECT pg_temp.insert_catalyst('mizuki-park', 'Tuyến Metro số 3A Bến Thành – Tân Kiên', 'infrastructure', 'high', 'long', 'speculative', '2030-12-31', 'Kết nối Mizuki với trung tâm TP.HCM');
SELECT pg_temp.insert_catalyst('mizuki-park', 'Mở rộng đường Nguyễn Văn Linh', 'infrastructure', 'medium', 'medium', 'confirmed', '2027-06-30', 'Cải thiện trục Đông – Tây Nam Sài Gòn');

-- Vinhomes Central Park (Bình Thạnh)
SELECT pg_temp.insert_catalyst('vinhomes-central-park', 'Cầu Thủ Thiêm 2 thành Ba Son hoàn thiện đồng bộ', 'infrastructure', 'medium', 'short', 'confirmed', '2026-06-30', 'Tăng kết nối với Thủ Thiêm');
SELECT pg_temp.insert_catalyst('vinhomes-central-park', 'Khu đô thị Thủ Thiêm tiếp tục hoàn thiện hạ tầng', 'economic', 'medium', 'medium', 'confirmed', '2027-12-31', 'Hệ sinh thái Đông Sài Gòn nâng tầm');

-- Vinhomes Smart City filler (extra for variety) — already done above

-- Phú Mỹ Hưng
SELECT pg_temp.insert_catalyst('phu-my-hung', 'Mở rộng Phú Mỹ Hưng giai đoạn 3', 'economic', 'high', 'medium', 'confirmed', '2027-12-31', 'Tăng diện tích đô thị, dân cư, dịch vụ');
SELECT pg_temp.insert_catalyst('phu-my-hung', 'Cầu Thủ Thiêm 4 nối Q.7 với Thủ Thiêm', 'infrastructure', 'high', 'long', 'speculative', '2029-12-31', 'Kết nối Q.7 với khu đô thị mới Thủ Thiêm');

-- Masteri Thảo Điền
SELECT pg_temp.insert_catalyst('masteri-thao-dien', 'Metro số 1 chính thức vận hành (ga An Phú)', 'infrastructure', 'high', 'short', 'confirmed', '2026-12-31', 'Ga metro sát dự án đi vào vận hành');
SELECT pg_temp.insert_catalyst('masteri-thao-dien', 'Khu Thảo Điền tiếp tục lên giá theo trục Metro', 'economic', 'medium', 'medium', 'confirmed', '2027-12-31', 'Cộng hưởng giá toàn khu Thảo Điền – An Phú');

-- Vinhomes Golden River (Q1)
SELECT pg_temp.insert_catalyst('vinhomes-golden-river', 'Hoàn thiện công viên Bến Bạch Đằng giai đoạn 2', 'commercial', 'medium', 'short', 'confirmed', '2026-12-31', 'Nâng cấp không gian công cộng ven sông sát dự án');

-- Empire City (Thủ Đức)
SELECT pg_temp.insert_catalyst('empire-city', 'Khu lõi Thủ Thiêm hoàn thành các tòa văn phòng tower', 'commercial', 'high', 'medium', 'confirmed', '2027-12-31', 'Empire City hưởng lợi trực tiếp từ trung tâm tài chính Thủ Thiêm');
SELECT pg_temp.insert_catalyst('empire-city', 'Cầu đi bộ qua sông Sài Gòn hoàn thành', 'infrastructure', 'medium', 'short', 'confirmed', '2026-12-31', 'Kết nối Thủ Thiêm – Q.1 cho người đi bộ');

-- The Sun Avenue (Q.2)
SELECT pg_temp.insert_catalyst('the-sun-avenue', 'Metro số 1 ga Bình Thái', 'infrastructure', 'high', 'short', 'confirmed', '2026-12-31', 'Ga metro sát dự án');

-- NovaWorld Phan Thiết
SELECT pg_temp.insert_catalyst('novaworld-phan-thiet', 'Cao tốc Dầu Giây – Phan Thiết hoàn thiện đồng bộ', 'infrastructure', 'high', 'short', 'confirmed', '2026-06-30', 'Rút ngắn TP.HCM – Phan Thiết còn ~2h');
SELECT pg_temp.insert_catalyst('novaworld-phan-thiet', 'Sân bay Phan Thiết khai thác thương mại', 'infrastructure', 'high', 'medium', 'confirmed', '2027-12-31', 'Mở cửa du lịch quốc tế cho Bình Thuận');

-- Royal City (Hà Nội)
SELECT pg_temp.insert_catalyst('royal-city', 'Mở rộng tuyến Nguyễn Trãi – Khuất Duy Tiến', 'infrastructure', 'medium', 'short', 'confirmed', '2026-12-31', 'Giảm ùn tắc trục huyết mạch Tây Nam Hà Nội');

-- Times City
SELECT pg_temp.insert_catalyst('times-city', 'Tuyến đường sắt đô thị số 1 đoạn Yên Viên – Ngọc Hồi', 'infrastructure', 'medium', 'long', 'speculative', '2030-12-31', 'Cải thiện kết nối phía Nam Hà Nội');

-- Diamond Island
SELECT pg_temp.insert_catalyst('diamond-island', 'Cầu Thủ Thiêm 4 nối Q.7 – Q.2', 'infrastructure', 'high', 'long', 'speculative', '2029-12-31', 'Tăng kết nối khu Đông – Nam');

-- Done
DROP FUNCTION pg_temp.insert_catalyst(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT);
