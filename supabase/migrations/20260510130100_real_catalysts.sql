-- ~25 real catalysts seeded for HCM / Hà Nội / Phan Thiết regions.
-- Each catalyst is fan-out to every project in the matching city/district scope.
-- Sources: cafef.vn, vneconomy.vn, baoxaydung.com.vn, tuoitre.vn (web research May 2026).

CREATE OR REPLACE FUNCTION pg_temp.bulk_catalyst(
  p_city TEXT, p_district TEXT,
  p_title TEXT, p_category TEXT, p_impact TEXT,
  p_horizon TEXT, p_status TEXT, p_year INT, p_desc TEXT, p_url TEXT
) RETURNS INT AS $$
DECLARE n INT := 0;
BEGIN
  INSERT INTO project_catalysts (project_id, title, category, impact, status, horizon, expected_date, source_url, description)
  SELECT id, p_title, p_category, p_impact, p_status, p_horizon, MAKE_DATE(p_year, 12, 31), p_url, p_desc
  FROM projects
  WHERE (p_city IS NULL OR city ILIKE '%'||p_city||'%')
    AND (p_district IS NULL OR district ILIKE '%'||p_district||'%')
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$ LANGUAGE plpgsql;

-- HCM-wide (all projects in HCM get these)
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', NULL, 'Long Thành Airport giai đoạn 1 vận hành', 'infrastructure', 'high', 'medium', 'confirmed', 2026, 'Sân bay quốc tế lớn nhất miền Nam mở cửa, kéo dòng FDI và du lịch', 'https://cafef.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', NULL, 'Vành đai 3 HCM hoàn thành đồng bộ', 'infrastructure', 'high', 'medium', 'confirmed', 2026, 'Tăng kết nối liên vùng HCM-Bình Dương-Đồng Nai', 'https://cafef.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', NULL, 'Cao tốc Bến Lức – Long Thành thông xe', 'infrastructure', 'high', 'short', 'confirmed', 2026, 'Rút ngắn khu Tây HCM với Long Thành', 'https://vneconomy.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', NULL, 'Trung tâm Tài chính Quốc tế Thủ Thiêm khởi động', 'commercial', 'high', 'short', 'confirmed', 2025, 'Trở thành tâm điểm tài chính khu vực, kéo nhu cầu nhà ở/cho thuê', 'https://cafef.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', NULL, 'Long Thành Airport giai đoạn 2', 'infrastructure', 'high', 'long', 'confirmed', 2032, 'Mở rộng công suất, tăng giá đất Đồng Nai – Nam Sài Gòn', 'https://cafef.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', NULL, 'Bệnh viện Vinmec Cần Giờ', 'commercial', 'medium', 'medium', 'confirmed', 2026, 'BV chuẩn quốc tế khu vực Nam Sài Gòn', 'https://tuoitre.vn');

-- HCM by district
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', 'Thủ Đức', 'Metro số 1 (Bến Thành – Suối Tiên) vận hành thương mại', 'infrastructure', 'high', 'short', 'confirmed', 2025, 'Tuyến metro đầu tiên TP.HCM chính thức chạy', 'https://cafef.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', 'Thủ Đức', 'Vành đai 2 đoạn TP. Thủ Đức hoàn thành', 'infrastructure', 'high', 'short', 'confirmed', 2027, 'Khép kín vành đai nội đô', 'https://cafef.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', 'Thủ Đức', 'Cầu Thủ Thiêm 4 nối Q.7 – Thủ Đức', 'infrastructure', 'high', 'medium', 'confirmed', 2028, 'Kết nối Khu Đông – Khu Nam, kích giá Q.7 và Thủ Đức', 'https://baoxaydung.com.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', 'Q.1', 'Cầu đi bộ Bến Bạch Đằng – Thủ Thiêm', 'infrastructure', 'medium', 'short', 'confirmed', 2026, 'Kết nối lõi tài chính Q.1 sang Thủ Thiêm', 'https://baoxaydung.com.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', 'Q.7', 'Cầu Cát Lái nối Q.7 – Đồng Nai', 'infrastructure', 'high', 'medium', 'confirmed', 2028, 'Mở thị trường BĐS Đồng Nai – Q.7', 'https://baoxaydung.com.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', 'Tân Phú', 'Metro số 2 (Bến Thành – Tham Lương)', 'infrastructure', 'high', 'long', 'confirmed', 2030, 'Tuyến metro tiếp theo khởi công lại 2025', 'https://vneconomy.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', 'Tân Phú', 'Aeon Mall Tân Phú giai đoạn 2', 'commercial', 'medium', 'short', 'confirmed', 2026, 'Mở rộng quy mô retail', 'https://cafef.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', 'Bình Chánh', 'Metro số 3a (Bến Thành – Tân Kiên)', 'infrastructure', 'high', 'long', 'speculative', 2032, 'Tuyến metro Tây Nam HCM', 'https://cafef.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', 'Bình Chánh', 'Vành đai 4 đoạn Bình Chánh', 'infrastructure', 'medium', 'long', 'confirmed', 2028, 'Hạ tầng cấp vùng cải thiện', 'https://cafef.vn');
SELECT pg_temp.bulk_catalyst('Hồ Chí Minh', 'Bình Thạnh', 'Cầu Thủ Thiêm 2 hoàn thiện đồng bộ kết nối Ba Son', 'infrastructure', 'medium', 'short', 'confirmed', 2026, 'Tăng kết nối với Thủ Thiêm', 'https://baoxaydung.com.vn');

-- Hà Nội infrastructure
SELECT pg_temp.bulk_catalyst('Hà Nội', NULL, 'Vành đai 4 vùng Thủ đô khởi động đoạn lớn', 'infrastructure', 'high', 'medium', 'confirmed', 2027, 'Tăng giá vùng ven Hà Nội', 'https://cafef.vn');
SELECT pg_temp.bulk_catalyst('Hà Nội', 'Gia Lâm', 'Gia Lâm chính thức lên quận', 'legal', 'high', 'short', 'confirmed', 2025, 'Nâng cấp hành chính, kích giá đất nội đô mở rộng', 'https://cafef.vn');
SELECT pg_temp.bulk_catalyst('Hà Nội', 'Đông Anh', 'Đông Anh chính thức lên quận', 'legal', 'high', 'short', 'confirmed', 2025, 'Phía Bắc Hà Nội nâng cấp hành chính', 'https://tuoitre.vn');
SELECT pg_temp.bulk_catalyst('Hà Nội', 'Thanh Xuân', 'Metro số 3 (Nhổn – Ga Hà Nội) ngầm hoàn thành', 'infrastructure', 'high', 'medium', 'confirmed', 2027, 'Tuyến metro phía Tây Nam vào lõi đô thị', 'https://baoxaydung.vn');
SELECT pg_temp.bulk_catalyst('Hà Nội', 'Nam Từ Liêm', 'Metro số 5 (Văn Cao – Hòa Lạc)', 'infrastructure', 'high', 'long', 'speculative', 2031, 'Tuyến trục Tây mở rộng', 'https://tuoitre.vn');
SELECT pg_temp.bulk_catalyst('Hà Nội', 'Bắc Từ Liêm', 'Metro số 2 (Nội Bài – trung tâm)', 'infrastructure', 'high', 'long', 'confirmed', 2029, 'Kết nối sân bay với lõi Hà Nội', 'https://tuoitre.vn');
SELECT pg_temp.bulk_catalyst('Hà Nội', 'Bắc Từ Liêm', 'Hòa Lạc Hi-Tech Park mở rộng', 'economic', 'high', 'medium', 'confirmed', 2026, 'Khu công nghệ cao thu hút FDI, kéo cầu thuê', 'https://cafef.vn');
SELECT pg_temp.bulk_catalyst('Hà Nội', 'Bắc Từ Liêm', 'Bệnh viện Vinmec Ocean Park 2', 'commercial', 'medium', 'medium', 'confirmed', 2026, 'Cơ sở y tế chuẩn quốc tế', 'https://tuoitre.vn');

-- Phan Thiết
SELECT pg_temp.bulk_catalyst(NULL, 'Phan Thiết', 'Sân bay Phan Thiết khai thác thương mại', 'infrastructure', 'high', 'medium', 'confirmed', 2027, 'Mở cửa du lịch quốc tế cho Bình Thuận', 'https://cafef.vn');
SELECT pg_temp.bulk_catalyst(NULL, 'Phan Thiết', 'Cao tốc Dầu Giây – Phan Thiết hoàn thiện đồng bộ', 'infrastructure', 'high', 'short', 'confirmed', 2026, 'Rút ngắn HCM – Phan Thiết còn ~2h', 'https://cafef.vn');

DROP FUNCTION pg_temp.bulk_catalyst(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INT, TEXT, TEXT);
