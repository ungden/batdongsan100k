-- Real launch prices (đồng / m²) sourced from web research:
-- batdongsan.com.vn, cafef.vn, vinhomes.vn, masterise.com, vietnamfinance.vn.
-- Replaces the heuristic backfill from 20260510120300_bootstrap_intel.sql.
--
-- Per-sqm prices in VND (BIGINT). Use mid-point of researched range.

UPDATE projects SET launch_price = 36000000,  completion_date = '2024' WHERE slug = 'vinhomes-grand-park';   -- 36 tr (mở bán 2018)
UPDATE projects SET launch_price = 30000000,  completion_date = '2020' WHERE slug = 'vinhomes-smart-city';   -- 30 tr (2018)
UPDATE projects SET launch_price = 30000000,  completion_date = '2020' WHERE slug = 'vinhomes-ocean-park';   -- 30 tr (2018)
UPDATE projects SET launch_price = 47000000,  completion_date = '2018' WHERE slug = 'vinhomes-central-park'; -- 47 tr (2010-2014)
UPDATE projects SET launch_price = 200000000, completion_date = '2018' WHERE slug = 'vinhomes-golden-river'; -- 200 tr (2015)
UPDATE projects SET launch_price = 42000000,  completion_date = '2021' WHERE slug = 'celadon-city';          -- 42 tr (2010)
UPDATE projects SET launch_price = 80000000,  completion_date = '2016' WHERE slug = 'masteri-thao-dien';     -- 80 tr (2014)
UPDATE projects SET launch_price = 50000000,  completion_date = '2019' WHERE slug = 'sunrise-city';          -- 50 tr (2017)
UPDATE projects SET launch_price = 60000000,  completion_date = '2020' WHERE slug = 'midtown';               -- 60 tr (2017)
UPDATE projects SET launch_price = 53000000,  completion_date = '2022' WHERE slug = 'mizuki-park';           -- 53 tr (2018)
UPDATE projects SET launch_price = 60000000,  completion_date = '2018' WHERE slug = 'diamond-island';        -- 60 tr (2013)
UPDATE projects SET launch_price = 65000000,  completion_date = '2019' WHERE slug = 'feliz-en-vista';        -- 65 tr (2016)
UPDATE projects SET launch_price = 48000000,  completion_date = '2021' WHERE slug = 'richstar';              -- 48 tr
UPDATE projects SET launch_price = 60000000,  completion_date = '2020' WHERE slug = 'vinhomes-metropolis';   -- 60 tr (2016)
UPDATE projects SET launch_price = 30000000,  completion_date = '2014' WHERE slug = 'royal-city';            -- 30 tr (2009)
UPDATE projects SET launch_price = 37000000,  completion_date = '2016' WHERE slug = 'times-city';            -- 37 tr (2011)
UPDATE projects SET launch_price = 27000000,  completion_date = '2018' WHERE slug = 'goldmark-city';         -- 27 tr (2015)
UPDATE projects SET launch_price = 70000000,  completion_date = '2019' WHERE slug = 'empire-city';           -- 70 tr (2017)
UPDATE projects SET launch_price = 75000000,  completion_date = '2020' WHERE slug = 'the-sun-avenue';        -- 75 tr
UPDATE projects SET launch_price = 70000000,  completion_date = '2018' WHERE slug = 'the-nassim';            -- 70 tr (2015)
UPDATE projects SET launch_price = 110000000, completion_date = '2020' WHERE slug = 'the-tresor';            -- 110 tr
UPDATE projects SET launch_price = 30000000,  completion_date = '2020' WHERE slug = 'sunshine-city';         -- 30 tr
UPDATE projects SET launch_price = 148000000, completion_date = '2018' WHERE slug = 'landmark-81';           -- 148 tr (2015)
-- Phú Mỹ Hưng: tổ hợp ongoing 1997 → keep heuristic.
-- NovaWorld Phan Thiết: villa/townhouse pricing, không per-sqm chuẩn → keep.
