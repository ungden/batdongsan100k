-- Payment + VIP packages infrastructure for batdongsan100k
-- Created 2026-04-26

CREATE TABLE IF NOT EXISTS public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric(12,0) NOT NULL DEFAULT 0,
  duration_days integer NOT NULL DEFAULT 30,
  priority integer NOT NULL DEFAULT 0,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  package_id uuid NOT NULL REFERENCES public.packages(id),
  order_code text UNIQUE NOT NULL,
  amount numeric(12,0) NOT NULL,
  plan text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled','expired')),
  sepay_transaction_id text,
  sepay_code text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_code ON public.payment_orders(order_code);

CREATE TABLE IF NOT EXISTS public.listing_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.packages(id),
  package_name text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_listing_packages_listing ON public.listing_packages(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_packages_active ON public.listing_packages(is_active, expires_at);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY packages_public_read ON public.packages FOR SELECT USING (is_active = true);
CREATE POLICY packages_admin_all ON public.packages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY payment_orders_owner_read ON public.payment_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY payment_orders_owner_insert ON public.payment_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY payment_orders_admin_all ON public.payment_orders FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY listing_packages_public_read ON public.listing_packages FOR SELECT USING (true);
CREATE POLICY listing_packages_admin_all ON public.listing_packages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));

INSERT INTO public.packages (name, slug, description, price, duration_days, priority, sort_order, features) VALUES
  ('Tin Thường',     'free',    'Đăng tin miễn phí, hiển thị thông thường', 0,       30, 0, 0, '["Đăng tin miễn phí","Hiển thị 30 ngày"]'),
  ('Tin VIP Bạc',    'silver',  'Hiển thị nổi bật, ưu tiên xếp hạng',       50000,   15, 1, 1, '["Huy hiệu VIP Bạc","Ưu tiên xếp hạng","Hiển thị 15 ngày"]'),
  ('Tin VIP Vàng',   'gold',    'Hiển thị TOP, viền nổi bật',                150000,  30, 2, 2, '["Huy hiệu VIP Vàng","Hiển thị TOP","Viền nổi bật","30 ngày"]'),
  ('Tin VIP Kim Cương','diamond','Hiển thị #1 trang chủ, premium support',   500000,  30, 3, 3, '["Huy hiệu Kim Cương","#1 trang chủ","Premium Support","30 ngày"]')
ON CONFLICT (slug) DO NOTHING;
