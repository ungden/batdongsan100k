-- Clean boilerplate descriptions from existing properties

UPDATE public.properties SET description = ''
WHERE description ILIKE '%meeyland có%ảnh về%'
   OR description ILIKE '%mã tin rao%'
   OR description ILIKE '%môi giới đăng tin%';

UPDATE public.properties SET description = ''
WHERE description ILIKE '%chotot.com%'
   OR description ILIKE '%cho tot%đăng tin%';

UPDATE public.properties SET description = ''
WHERE description ILIKE '%nguon:%' AND description ILIKE '%url goc:%';

UPDATE public.properties SET description = ''
WHERE length(description) > 0 AND length(description) < 20;

UPDATE public.properties SET description = left(description, 2000)
WHERE length(description) > 2000;
