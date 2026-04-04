-- Fill project info for all remaining projects
-- Data from public real estate sources

-- === HCM - Large projects ===

UPDATE public.projects SET developer='Vạn Phúc Group', total_units=10000, floors=5, blocks=0, total_area_ha=198, apartment_types=ARRAY['Biệt thự','Nhà phố','Shophouse'], completion_date='2018-2025', legal_status='Sổ hồng', price_range='12 - 45 tỷ', description='Khu đô thị Vạn Phúc City tại Thủ Đức, TP.HCM. Khu biệt thự - nhà phố cao cấp ven sông Sài Gòn với hạ tầng đồng bộ.', badges=ARRAY['hot','featured'] WHERE slug='van-phuc-city';

UPDATE public.projects SET developer='Khang Điền', total_units=5000, floors=5, total_area_ha=50, apartment_types=ARRAY['Nhà phố','Biệt thự','Căn hộ'], completion_date='2010-nay', legal_status='Sổ hồng', price_range='3 - 15 tỷ', description='Hệ thống khu dân cư Khang Điền tại Quận 9 (Thủ Đức), TP.HCM. Uy tín 20+ năm phát triển nhà ở.', badges=ARRAY['featured'] WHERE slug='khang-dien';

UPDATE public.projects SET developer='Handico + UDIC', total_units=12000, floors=30, blocks=20, total_area_ha=45, apartment_types=ARRAY['1PN','2PN','3PN','Biệt thự'], completion_date='2010-nay', legal_status='Sổ hồng', price_range='2.5 - 8 tỷ', description='Khu ngoại giao đoàn tại Bắc Từ Liêm, Hà Nội. Khu đô thị dành cho cán bộ ngoại giao và dân cư cao cấp.', badges=ARRAY['hot'] WHERE slug='ngoai-giao-doan';

UPDATE public.projects SET developer='Phát Đạt', total_units=3000, floors=25, blocks=4, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2021', legal_status='Sổ hồng', handover_standard='Hoàn thiện cơ bản', price_range='2 - 3.5 tỷ', description='Dự án căn hộ Prosper tại Quận 12, TP.HCM. Giá tốt, tiện ích đầy đủ, phù hợp gia đình trẻ.', badges=ARRAY['hot'] WHERE slug='prosper';

UPDATE public.projects SET developer='Novaland', total_units=1800, floors=20, blocks=3, apartment_types=ARRAY['2PN','3PN','Shophouse'], completion_date='2018', legal_status='Sổ hồng', handover_standard='Hoàn thiện cơ bản', price_range='3 - 5.5 tỷ', rental_yield=5.0, description='Sunrise Riverside tại Nhà Bè, TP.HCM. View sông thoáng mát, kết nối Phú Mỹ Hưng.', badges=ARRAY['featured'] WHERE slug='sunrise-riverside';

UPDATE public.projects SET developer='Ciputra Group', total_units=15000, floors=30, blocks=20, total_area_ha=301, apartment_types=ARRAY['Biệt thự','Nhà phố','Căn hộ','Penthouse'], completion_date='2004-nay', legal_status='Sổ hồng', price_range='3 - 30 tỷ', description='Khu đô thị quốc tế Ciputra tại Tây Hồ, Hà Nội. Khu đô thị đẳng cấp quốc tế đầu tiên của Hà Nội.', badges=ARRAY['featured'] WHERE slug='ciputra';

UPDATE public.projects SET developer='Vingroup', total_units=1000, floors=81, blocks=1, apartment_types=ARRAY['2PN','3PN','4PN','Penthouse','Sky Villa'], completion_date='2018', legal_status='Sổ hồng', handover_standard='Hoàn thiện cao cấp', price_range='8 - 50 tỷ', description='Landmark 81 - Tòa nhà cao nhất Việt Nam (461m). Căn hộ siêu sang tại Bình Thạnh, TP.HCM.', badges=ARRAY['featured'] WHERE slug='landmark-81';

UPDATE public.projects SET developer='Vạn Thái Land', total_units=2600, floors=32, blocks=3, apartment_types=ARRAY['2PN','3PN'], completion_date='2020', legal_status='Sổ hồng', handover_standard='Hoàn thiện cơ bản', price_range='2 - 3.5 tỷ', description='Topaz Elite tại Quận 8, TP.HCM. Căn hộ giá tốt, view sông, tiện ích đầy đủ.', badges=ARRAY['hot'] WHERE slug='topaz-elite';

UPDATE public.projects SET developer='Phú Mỹ Hưng', total_units=2000, floors=15, blocks=6, apartment_types=ARRAY['2PN','3PN'], completion_date='2007', legal_status='Sổ hồng', price_range='3.5 - 6 tỷ', description='Sky Garden tại Quận 7, TP.HCM. Khu căn hộ trong lòng Phú Mỹ Hưng, nhiều cây xanh.', badges=ARRAY['featured'] WHERE slug='sky-garden';

UPDATE public.projects SET developer='Đức Khải', total_units=4000, floors=30, blocks=5, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2019', legal_status='Sổ hồng', handover_standard='Hoàn thiện cơ bản', price_range='1.5 - 2.5 tỷ', description='Dream Home tại Quận 8 và Gò Vấp, TP.HCM. Căn hộ bình dân, phù hợp người mua nhà lần đầu.', badges=ARRAY['hot'] WHERE slug='dream-home';

UPDATE public.projects SET developer='TEDI South', total_units=1500, floors=36, blocks=2, apartment_types=ARRAY['1PN','2PN','3PN','Officetel'], completion_date='2018', legal_status='Sổ hồng', handover_standard='Hoàn thiện cao cấp', price_range='3.5 - 6 tỷ', description='The Manor tại Bình Thạnh, TP.HCM / Mễ Trì, Hà Nội. Căn hộ dịch vụ cao cấp tiêu chuẩn quốc tế.', badges=ARRAY['featured'] WHERE slug='the-manor';

UPDATE public.projects SET developer='Masterise Homes', total_units=4500, floors=35, blocks=5, apartment_types=ARRAY['Studio','1PN','2PN','3PN'], completion_date='2025', legal_status='HĐMB', handover_standard='Hoàn thiện cao cấp', price_range='3 - 7 tỷ', description='Sola Park tại Vinhomes Smart City, Hà Nội. Phân khu mới nhất do Masterise Homes phát triển.', badges=ARRAY['new','hot'] WHERE slug='sola-park';

UPDATE public.projects SET developer='Hưng Thịnh Corp', total_units=2500, floors=28, blocks=3, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2022', legal_status='Sổ hồng', handover_standard='Hoàn thiện cơ bản', price_range='2 - 3.5 tỷ', description='Lavita tại Thủ Đức, TP.HCM. Căn hộ gần ga Metro, kết nối trung tâm thuận tiện.', badges=ARRAY['hot'] WHERE slug='lavita';

UPDATE public.projects SET developer='Vạn Thái Land', total_units=1800, floors=20, blocks=3, apartment_types=ARRAY['2PN','3PN'], completion_date='2018', legal_status='Sổ hồng', price_range='1.5 - 2.5 tỷ', description='Topaz Home tại Quận 12, TP.HCM. Căn hộ giá rẻ, phù hợp người thu nhập trung bình.', badges=ARRAY['hot'] WHERE slug='topaz-home';

UPDATE public.projects SET developer='TNR Holdings', total_units=1800, floors=33, blocks=2, apartment_types=ARRAY['1PN','2PN','3PN','Penthouse'], completion_date='2017', legal_status='Sổ hồng', handover_standard='Hoàn thiện cao cấp', price_range='3.5 - 7 tỷ', rental_yield=5.0, description='The Gold View tại Quận 4, TP.HCM. View trực diện kênh Bến Nghé và Bitexco.', badges=ARRAY['featured'] WHERE slug='the-gold-view';

UPDATE public.projects SET developer='Xuân Mai Corp', total_units=1500, floors=25, blocks=2, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2019', legal_status='Sổ hồng', handover_standard='Hoàn thiện cao cấp', price_range='2.5 - 5 tỷ', rental_yield=4.5, description='Eco Green tại Quận 7, TP.HCM. Khu phức hợp xanh gần Phú Mỹ Hưng.', badges=ARRAY['featured'] WHERE slug='eco-green';

UPDATE public.projects SET developer='Novaland', total_units=1400, floors=30, blocks=2, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2018', legal_status='Sổ hồng', handover_standard='Hoàn thiện cao cấp', price_range='3.5 - 6 tỷ', rental_yield=5.0, description='Botanica tại Tân Bình, TP.HCM. Gần sân bay Tân Sơn Nhất, kết nối thuận tiện.', badges=ARRAY['featured'] WHERE slug='botanica';

UPDATE public.projects SET developer='Điền Phúc Thành', total_units=900, floors=20, blocks=2, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2019', legal_status='Sổ hồng', price_range='2.5 - 4 tỷ', description='Centana tại Quận 2 (Thủ Đức), TP.HCM. Căn hộ gần ga Metro An Phú.', badges=ARRAY['new'] WHERE slug='centana';

UPDATE public.projects SET developer='Novaland', total_units=1200, floors=35, blocks=1, apartment_types=ARRAY['1PN','2PN','3PN','Officetel'], completion_date='2018', legal_status='Sổ hồng', handover_standard='Hoàn thiện cao cấp', price_range='4 - 7 tỷ', description='Millennium tại Quận 4, TP.HCM. Căn hộ cao cấp trung tâm, gần Quận 1.', badges=ARRAY['featured'] WHERE slug='millennium';

UPDATE public.projects SET developer='Sacomreal', total_units=3000, floors=25, blocks=4, apartment_types=ARRAY['1PN','2PN','3PN','Shophouse'], completion_date='2020', legal_status='Sổ hồng', price_range='2 - 4 tỷ', description='Jamona tại Quận 7, TP.HCM. Khu phức hợp căn hộ - thương mại ven sông.', badges=ARRAY['hot'] WHERE slug='jamona';

UPDATE public.projects SET developer='Phú Long', total_units=1500, floors=18, blocks=3, apartment_types=ARRAY['2PN','3PN'], completion_date='2010', legal_status='Sổ hồng', price_range='3.5 - 6 tỷ', description='Dragon Hill tại Quận 7, TP.HCM. Khu căn hộ trong Phú Mỹ Hưng.', badges=ARRAY['featured'] WHERE slug='dragon-hill';

UPDATE public.projects SET developer='Trần Anh Group', total_units=2000, floors=20, blocks=3, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2020', legal_status='Sổ hồng', price_range='1.5 - 2.5 tỷ', description='Green Town tại Bình Tân, TP.HCM. Căn hộ giá tốt cho gia đình trẻ.', badges=ARRAY['hot'] WHERE slug='green-town';

UPDATE public.projects SET developer='Phát Đạt', total_units=1600, floors=40, blocks=2, apartment_types=ARRAY['1PN','2PN','3PN','Officetel','Penthouse'], completion_date='2019', legal_status='Sổ hồng', handover_standard='Hoàn thiện cao cấp', price_range='3 - 8 tỷ', description='The EverRich Infinity tại Quận 5, TP.HCM. Căn hộ cao cấp trung tâm.', badges=ARRAY['featured'] WHERE slug='the-everrich';

UPDATE public.projects SET developer='Phú Long', total_units=600, floors=25, blocks=2, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2018', legal_status='Sổ hồng', price_range='2.5 - 4 tỷ', description='The Park Residence tại Quận 7, TP.HCM. Khu căn hộ trong Phú Mỹ Hưng.', badges=ARRAY['featured'] WHERE slug='the-park-residence';

UPDATE public.projects SET developer='Novaland', total_units=800, floors=30, blocks=1, apartment_types=ARRAY['1PN','2PN','3PN','Officetel'], completion_date='2018', legal_status='Sổ hồng', handover_standard='Hoàn thiện cao cấp', price_range='4 - 8 tỷ', rental_yield=5.5, description='Saigon Royal tại Quận 4, TP.HCM. View Bến Vân Đồn và sông Sài Gòn.', badges=ARRAY['featured'] WHERE slug='saigon-royal';

UPDATE public.projects SET developer='Novaland', total_units=2000, floors=5, total_area_ha=30, apartment_types=ARRAY['Biệt thự','Nhà phố','Shophouse'], completion_date='2019', legal_status='Sổ hồng', price_range='8 - 25 tỷ', description='Lakeview City tại Quận 2 (Thủ Đức), TP.HCM. Khu biệt thự - nhà phố ven hồ.', badges=ARRAY['featured'] WHERE slug='lakeview-city';

UPDATE public.projects SET developer='Phú Mỹ Hưng', total_units=400, floors=20, blocks=2, apartment_types=ARRAY['2PN','3PN','4PN'], completion_date='2015', legal_status='Sổ hồng', price_range='4 - 8 tỷ', description='Scenic Valley tại Quận 7, TP.HCM. Căn hộ view công viên trong lòng Phú Mỹ Hưng.', badges=ARRAY['featured'] WHERE slug='scenic-valley';

UPDATE public.projects SET developer='LDG Group', total_units=1000, floors=20, blocks=2, apartment_types=ARRAY['2PN','3PN'], completion_date='2020', legal_status='Sổ hồng', price_range='1.8 - 2.5 tỷ', description='Tara Residence tại Quận 8, TP.HCM. Căn hộ giá tốt ven sông.', badges=ARRAY['new'] WHERE slug='tara-residence';

UPDATE public.projects SET developer='LDG Group', total_units=1500, floors=25, blocks=2, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2021', legal_status='Sổ hồng', price_range='1.5 - 2.5 tỷ', description='Saigon Intela tại Bình Chánh, TP.HCM. Căn hộ thông minh giá rẻ.', badges=ARRAY['new'] WHERE slug='saigon-intela';

UPDATE public.projects SET developer='Hưng Thịnh Corp', total_units=2000, floors=25, blocks=3, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2020', legal_status='Sổ hồng', price_range='2 - 3.5 tỷ', description='Moonlight tại Bình Tân/Thủ Đức, TP.HCM. Chuỗi căn hộ giá tốt của Hưng Thịnh.', badges=ARRAY['hot'] WHERE slug='moonlight';

UPDATE public.projects SET developer='Khang Điền', total_units=1200, floors=25, blocks=2, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2020', legal_status='Sổ hồng', handover_standard='Hoàn thiện cơ bản', price_range='2.5 - 4 tỷ', description='Safira tại Quận 9 (Thủ Đức), TP.HCM. Căn hộ xanh của Khang Điền.', badges=ARRAY['new'] WHERE slug='safira';

UPDATE public.projects SET developer='Novaland', total_units=600, floors=25, blocks=1, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2020', legal_status='Sổ hồng', price_range='3.5 - 6 tỷ', description='Grand Riverside tại Quận 4, TP.HCM. Căn hộ view sông trung tâm.', badges=ARRAY['featured'] WHERE slug='grand-riverside';

UPDATE public.projects SET developer='Phú Mỹ Hưng', total_units=300, floors=18, blocks=2, apartment_types=ARRAY['2PN','3PN'], completion_date='2016', legal_status='Sổ hồng', price_range='4 - 7 tỷ', description='Hưng Phúc (Happy Residence) tại Quận 7, TP.HCM. Căn hộ cao cấp Phú Mỹ Hưng.', badges=ARRAY['featured'] WHERE slug='hung-phuc';

UPDATE public.projects SET developer='Phú Mỹ Hưng', total_units=300, floors=18, blocks=2, apartment_types=ARRAY['2PN','3PN'], completion_date='2012', legal_status='Sổ hồng', price_range='3.5 - 6 tỷ', description='Happy Valley tại Quận 7, TP.HCM. Căn hộ view sông trong Phú Mỹ Hưng.', badges=ARRAY['featured'] WHERE slug='happy-valley';

UPDATE public.projects SET developer='NBB', total_units=2500, floors=25, blocks=3, apartment_types=ARRAY['1PN','2PN','3PN','Shophouse'], completion_date='2020', legal_status='Sổ hồng', price_range='1.8 - 3 tỷ', description='City Gate tại Quận 8, TP.HCM. Căn hộ giá tốt, mặt tiền đại lộ Võ Văn Kiệt.', badges=ARRAY['hot'] WHERE slug='city-gate';

UPDATE public.projects SET developer='Đại Quang Minh', total_units=5000, floors=30, blocks=10, total_area_ha=100, apartment_types=ARRAY['Biệt thự','Nhà phố','Căn hộ','Shophouse'], completion_date='2015-nay', legal_status='Sổ hồng', price_range='5 - 50 tỷ', description='Khu đô thị Sala tại Quận 2 (Thủ Đức), TP.HCM. Khu đô thị kiểu mẫu Đông Sài Gòn.', badges=ARRAY['featured'] WHERE slug='sala';

UPDATE public.projects SET developer='Đức Khải', total_units=3000, floors=25, blocks=4, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2015', legal_status='Sổ hồng', price_range='1.5 - 2.5 tỷ', description='Era Town tại Quận 7, TP.HCM. Khu căn hộ giá rẻ gần Phú Mỹ Hưng.', badges=ARRAY['hot'] WHERE slug='era-town';

UPDATE public.projects SET developer='Phú Hoàng Anh', total_units=1200, floors=20, blocks=3, apartment_types=ARRAY['2PN','3PN','4PN','Penthouse'], completion_date='2012', legal_status='Sổ hồng', price_range='2.5 - 4 tỷ', description='Phú Hoàng Anh tại Nhà Bè, TP.HCM. Căn hộ view sông, gần Phú Mỹ Hưng.', badges=ARRAY['new'] WHERE slug='phu-hoang-anh';

UPDATE public.projects SET developer='Sacomreal', total_units=600, floors=20, blocks=1, apartment_types=ARRAY['2PN','3PN'], completion_date='2019', legal_status='Sổ hồng', price_range='3 - 5 tỷ', description='Saigon South Residence tại Quận 7, TP.HCM. Căn hộ cạnh Phú Mỹ Hưng.', badges=ARRAY['new'] WHERE slug='saigon-south';

UPDATE public.projects SET developer='Nam Long Group', total_units=3500, floors=25, blocks=4, apartment_types=ARRAY['1PN','2PN','3PN','Shophouse'], completion_date='2024', legal_status='HĐMB', handover_standard='Hoàn thiện cơ bản', price_range='2.5 - 4 tỷ', description='Akari City tại Bình Tân, TP.HCM. Dự án đô thị Nhật Bản của Nam Long.', badges=ARRAY['new','hot'] WHERE slug='akari-city';

UPDATE public.projects SET developer='Sunwah Group', total_units=1400, floors=45, blocks=2, apartment_types=ARRAY['1PN','2PN','3PN','Penthouse'], completion_date='2020', legal_status='Sổ hồng', handover_standard='Hoàn thiện cao cấp', price_range='5 - 15 tỷ', rental_yield=5.0, description='Sunwah Pearl tại Bình Thạnh, TP.HCM. Căn hộ hạng sang view sông Sài Gòn.', badges=ARRAY['featured'] WHERE slug='sunwah-pearl';

UPDATE public.projects SET developer='CapitaLand', total_units=1200, floors=30, blocks=2, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2019', legal_status='Sổ hồng', handover_standard='Hoàn thiện cao cấp', price_range='3.5 - 6 tỷ', rental_yield=5.0, description='Vista Verde tại Quận 2 (Thủ Đức), TP.HCM. Căn hộ xanh của CapitaLand.', badges=ARRAY['featured'] WHERE slug='vista-verde';

UPDATE public.projects SET developer='Phú Mỹ Hưng', total_units=400, floors=18, blocks=2, apartment_types=ARRAY['3PN','4PN'], completion_date='2014', legal_status='Sổ hồng', price_range='5 - 9 tỷ', description='Green Valley tại Quận 7, TP.HCM. Căn hộ view sân golf trong Phú Mỹ Hưng.', badges=ARRAY['featured'] WHERE slug='green-valley';

UPDATE public.projects SET developer='EZLand', total_units=600, floors=20, blocks=2, apartment_types=ARRAY['1PN','2PN'], completion_date='2019', legal_status='Sổ hồng', price_range='2 - 3 tỷ', description='Hausneo tại Quận 9 (Thủ Đức), TP.HCM. Căn hộ giá tốt cho người trẻ.', badges=ARRAY['new'] WHERE slug='hausneo';

UPDATE public.projects SET developer='Đất Xanh Group', total_units=500, floors=20, blocks=1, apartment_types=ARRAY['1PN','2PN'], completion_date='2018', legal_status='Sổ hồng', price_range='2 - 3.5 tỷ', description='Luxcity tại Quận 7, TP.HCM. Căn hộ officetel gần Phú Mỹ Hưng.', badges=ARRAY['new'] WHERE slug='luxcity';

UPDATE public.projects SET developer='Văn Phú Invest', total_units=500, floors=30, blocks=1, apartment_types=ARRAY['2PN','3PN','4PN'], completion_date='2010', legal_status='Sổ hồng', price_range='3 - 5 tỷ', description='Hùng Vương Plaza tại Quận 5, TP.HCM. Khu phức hợp căn hộ - thương mại trung tâm.', badges=ARRAY['featured'] WHERE slug='hung-vuong-plaza';

-- === HÀ NỘI ===

UPDATE public.projects SET developer='MIK Group', total_units=3000, floors=35, blocks=5, apartment_types=ARRAY['1PN','2PN','3PN'], completion_date='2020', legal_status='Sổ hồng', handover_standard='Hoàn thiện cơ bản', price_range='2.5 - 5 tỷ', description='Imperia Sky Garden tại Hai Bà Trưng, Hà Nội. Căn hộ với vườn treo trên cao.', badges=ARRAY['hot'] WHERE slug='imperia-sky-garden';

UPDATE public.projects SET developer='Vingroup', total_units=3000, floors=5, total_area_ha=180, apartment_types=ARRAY['Biệt thự','Nhà phố','Liền kề'], completion_date='2006-nay', legal_status='Sổ hồng', price_range='10 - 50 tỷ', description='Vinhomes Riverside (Long Biên) - Khu biệt thự ven sông đầu tiên của Hà Nội.', badges=ARRAY['featured'] WHERE slug='vinhomes-riverside';

-- === NGHỈ DƯỠNG ===

UPDATE public.projects SET developer='Mường Thanh Group', total_units=50000, floors=40, apartment_types=ARRAY['Studio','1PN','2PN','3PN'], completion_date='2005-nay', legal_status='HĐMB', price_range='1 - 5 tỷ', description='Hệ thống khách sạn - căn hộ Mường Thanh toàn quốc. Thương hiệu BĐS nghỉ dưỡng lớn nhất Việt Nam.', badges=ARRAY['hot'] WHERE slug='muong-thanh';
