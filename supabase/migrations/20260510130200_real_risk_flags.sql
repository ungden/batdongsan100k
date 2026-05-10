-- Real-world risk flags for projects with publicly-known issues.
-- Sources: theinvestor.vn, asia-prop.com, vietnam.vn (May 2026 research).

-- Vinhomes Grand Park: Origami section bán chậm 2022-2025, 1 số căn giảm 10-20%
UPDATE project_intel SET
  risk_tags = ARRAY['supply_glut', 'mixed_section_performance'],
  weaknesses = ARRAY[
    'Phân khu Origami: nhiều căn bán chậm 2022-2025, giảm 10-20% so giá mở bán',
    'Nguồn cung thứ cấp lớn (1000+ tin trên thị trường)',
    'Khoảng cách tới trung tâm xa, phụ thuộc Metro 1 vận hành ổn định'
  ],
  risks = ARRAY[
    'Cần chọn block/phân khu kỹ — Origami yếu hơn Origami Sapphire/Beverly',
    'Phí quản lý cao và tăng dần theo năm',
    'Giá rao có thể chênh đáng kể với giá giao dịch thật'
  ]
WHERE project_id = (SELECT id FROM projects WHERE slug = 'vinhomes-grand-park');

-- Sunrise City (Novaland): ~7000 căn chờ sổ hồng đang được TP.HCM tháo gỡ Q1 2025
UPDATE project_intel SET
  risk_tags = ARRAY['legal_pending', 'developer_distressed'],
  weaknesses = ARRAY[
    'Khoảng 7000 căn chờ sổ hồng, đang được TP.HCM tháo gỡ pháp lý',
    'Chủ đầu tư Novaland đang tái cấu trúc tài chính (lỗ 4.4T VND 2024)'
  ],
  risks = ARRAY[
    'Pháp lý chưa hoàn thiện 100%, cần kiểm tra tình trạng sổ trước khi mua',
    'Rủi ro thanh khoản nếu market downturn vì hàng tồn của CĐT lớn',
    'Giá có thể bị áp lực giảm khi CĐT đẩy hàng để giải phóng dòng tiền'
  ]
WHERE project_id = (SELECT id FROM projects WHERE slug = 'sunrise-city');

-- NovaWorld Phan Thiết: pháp lý đã dừng 2+ năm (2022-2025), mới được tháo gỡ
UPDATE project_intel SET
  risk_tags = ARRAY['legal_pending', 'developer_distressed', 'speculative_zone'],
  weaknesses = ARRAY[
    'Pháp lý đã dừng 2+ năm (2022-2025), mới được TP.HCM tháo gỡ',
    'Loại hình second home nghỉ dưỡng — cầu thuê phụ thuộc du lịch',
    'Vị trí xa lõi đô thị, phụ thuộc sân bay Phan Thiết và cao tốc'
  ],
  risks = ARRAY[
    'Cao: rủi ro thanh khoản second-home lớn',
    'Cần chờ sân bay Phan Thiết vận hành (2027) mới thấy catalyst rõ',
    'Chủ đầu tư Novaland đang khó khăn tài chính'
  ]
WHERE project_id = (SELECT id FROM projects WHERE slug = 'novaworld-phan-thiet');

-- Aqua City (nếu có trong DB) — pháp lý từng dừng nhiều năm
UPDATE project_intel SET
  risk_tags = ARRAY['legal_pending', 'developer_distressed'],
  risks = ARRAY[
    'Pháp lý từng dừng nhiều năm, mới được tháo gỡ',
    'CĐT Novaland đang tái cơ cấu tài chính'
  ]
WHERE project_id IN (SELECT id FROM projects WHERE slug LIKE '%aqua-city%');

-- Auto-flag every project with a Tier-3 developer (Novaland, TNR, FLC, Tân Hoàng Minh, Refico, Saigonres)
WITH distressed AS (
  SELECT id FROM projects
  WHERE developer ~* '(novaland|tnr holdings|^flc|tân hoàng minh|refico|saigonres)'
)
UPDATE project_intel SET
  risk_tags = CASE
    WHEN 'developer_distressed' = ANY(COALESCE(risk_tags, '{}'))
    THEN risk_tags
    ELSE COALESCE(risk_tags, '{}') || ARRAY['developer_distressed']
  END,
  risks = CASE
    WHEN array_length(risks, 1) IS NULL OR array_length(risks, 1) = 0 THEN
      ARRAY['Chủ đầu tư đang trong giai đoạn tái cơ cấu / có vấn đề pháp lý — cần kiểm tra kỹ trước khi xuống tiền']
    ELSE risks
  END
WHERE project_id IN (SELECT id FROM distressed);
