-- ============ ENUM ============
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');

-- ============ updated_at helper ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ AUTO-CREATE PROFILE + bootstrap admin ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT,
  description TEXT,
  ingredients TEXT,
  how_to_use TEXT,
  price NUMERIC(10,2) NOT NULL,
  sale_price NUMERIC(10,2),
  stock INT NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 4.8,
  review_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_featured ON public.products(featured) WHERE featured = true;

-- ============ CART ============
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ PROMO CODES ============
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_order NUMERIC(10,2) DEFAULT 0,
  max_uses INT,
  uses INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active promo codes public read" ON public.promo_codes FOR SELECT USING (active = true);
CREATE POLICY "Admins manage promo codes" ON public.promo_codes FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT ('GLW-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  shipping_postal TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  promo_code TEXT,
  status public.order_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view items of own orders" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Anyone create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Public order lookup by order_number + email (security definer function)
CREATE OR REPLACE FUNCTION public.lookup_order(_order_number TEXT, _email TEXT)
RETURNS TABLE (
  id UUID, order_number TEXT, status public.order_status, total NUMERIC,
  full_name TEXT, email TEXT, shipping_address TEXT, shipping_city TEXT,
  shipping_country TEXT, created_at TIMESTAMPTZ
) LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.id, o.order_number, o.status, o.total, o.full_name, o.email,
         o.shipping_address, o.shipping_city, o.shipping_country, o.created_at
  FROM public.orders o
  WHERE o.order_number = _order_number AND lower(o.email) = lower(_email);
$$;

CREATE OR REPLACE FUNCTION public.lookup_order_items(_order_number TEXT, _email TEXT)
RETURNS TABLE (
  product_name TEXT, product_image TEXT, unit_price NUMERIC, quantity INT
) LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT oi.product_name, oi.product_image, oi.unit_price, oi.quantity
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  WHERE o.order_number = _order_number AND lower(o.email) = lower(_email);
$$;

-- ============ SUPPORT TICKETS ============
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone create tickets" ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all tickets" ON public.support_tickets FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update tickets" ON public.support_tickets FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- ============ CHAT MESSAGES ============
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chat" ON public.chat_messages FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE INDEX idx_chat_session ON public.chat_messages(session_id, created_at);

-- ============ SEED DATA ============
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Skincare', 'skincare', 'Cleansers, toners, serums and moisturizers', 1),
  ('Makeup', 'makeup', 'Lips, cheeks, eyes and complexion', 2),
  ('Suncare', 'suncare', 'SPF protection and aftersun', 3),
  ('Masks', 'masks', 'Sheet masks and treatments', 4),
  ('Body & Hair', 'body-hair', 'Body care and haircare essentials', 5),
  ('Sets & Gifts', 'sets-gifts', 'Curated sets and gift bundles', 6);

INSERT INTO public.products (name, slug, brand, description, ingredients, how_to_use, price, sale_price, stock, category_id, image_url, featured, is_new, rating, review_count)
SELECT * FROM (VALUES
  ('Hydra Glow Essence Serum', 'hydra-glow-essence-serum', 'Soomi', 'A weightless essence with hyaluronic acid and ginseng for dewy skin.', 'Hyaluronic Acid, Ginseng Root, Niacinamide', 'Apply 2-3 drops to clean skin morning and night.', 48.00, 39.00, 120, (SELECT id FROM public.categories WHERE slug='skincare'), 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80', true, true, 4.9, 248),
  ('Velvet Rouge Lip Tint', 'velvet-rouge-lip-tint', 'Hwa', 'Long-lasting matte lip tint with a velvet finish.', 'Vitamin E, Jojoba Oil', 'Apply on bare lips for a soft matte finish.', 22.00, NULL, 320, (SELECT id FROM public.categories WHERE slug='makeup'), 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80', true, false, 4.8, 612),
  ('Aqua Shield Sunscreen SPF50+', 'aqua-shield-sunscreen-spf50', 'Soomi', 'Lightweight daily UV protection with a milky finish.', 'Zinc Oxide, Centella Asiatica', 'Apply generously 15 mins before sun exposure.', 32.00, 28.00, 200, (SELECT id FROM public.categories WHERE slug='suncare'), 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', true, false, 4.9, 489),
  ('Gold Caviar Sheet Mask (5pcs)', 'gold-caviar-sheet-mask', 'Luxe K', 'Anti-aging sheet mask with gold and caviar extract.', 'Gold, Caviar Extract, Peptides', 'Apply on clean face for 20 minutes.', 35.00, NULL, 150, (SELECT id FROM public.categories WHERE slug='masks'), 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800&q=80', true, true, 4.7, 134),
  ('Snow Bloom Brightening Toner', 'snow-bloom-brightening-toner', 'Hwa', 'Brightening toner with niacinamide and rice extract.', 'Niacinamide, Rice Extract', 'Soak a cotton pad and swipe across face.', 28.00, NULL, 180, (SELECT id FROM public.categories WHERE slug='skincare'), 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80', false, false, 4.6, 198),
  ('Silk Veil Cushion Foundation', 'silk-veil-cushion-foundation', 'Hwa', 'Dewy cushion with buildable medium coverage.', 'Hyaluronic Acid, SPF 50+', 'Press lightly with the puff.', 42.00, 36.00, 90, (SELECT id FROM public.categories WHERE slug='makeup'), 'https://images.unsplash.com/photo-1631214540242-3cd8c4b0b3b8?w=800&q=80', true, false, 4.8, 372),
  ('Midnight Repair Night Cream', 'midnight-repair-night-cream', 'Luxe K', 'Rich overnight cream with retinol and peptides.', 'Retinol, Peptides, Squalane', 'Apply at night to clean skin.', 65.00, NULL, 70, (SELECT id FROM public.categories WHERE slug='skincare'), 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80', true, true, 4.9, 156),
  ('Bamboo Charcoal Cleanser', 'bamboo-charcoal-cleanser', 'Soomi', 'Deep pore cleanser with bamboo charcoal.', 'Bamboo Charcoal, Tea Tree', 'Lather with water and rinse.', 24.00, NULL, 240, (SELECT id FROM public.categories WHERE slug='skincare'), 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80', false, false, 4.5, 287),
  ('Peach Glow Blush Stick', 'peach-glow-blush-stick', 'Hwa', 'Creamy blush stick for a natural flush.', 'Vitamin E', 'Dab on cheeks and blend.', 20.00, NULL, 280, (SELECT id FROM public.categories WHERE slug='makeup'), 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=800&q=80', false, true, 4.7, 145),
  ('Royal Ginseng Eye Cream', 'royal-ginseng-eye-cream', 'Luxe K', 'Firming eye cream with red ginseng and gold.', 'Red Ginseng, Gold', 'Pat gently around the eyes.', 58.00, 49.00, 110, (SELECT id FROM public.categories WHERE slug='skincare'), 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', true, false, 4.8, 203),
  ('Cherry Blossom Body Wash', 'cherry-blossom-body-wash', 'Soomi', 'Sulfate-free body wash with cherry blossom extract.', 'Cherry Blossom, Glycerin', 'Lather and rinse off.', 18.00, NULL, 300, (SELECT id FROM public.categories WHERE slug='body-hair'), 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=800&q=80', false, false, 4.6, 178),
  ('K-Beauty Discovery Set', 'k-beauty-discovery-set', 'Luxe K', 'Curated 5-piece discovery set of bestsellers.', 'Various', 'Try each product as directed.', 89.00, 69.00, 60, (SELECT id FROM public.categories WHERE slug='sets-gifts'), 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80', true, true, 4.9, 421)
) AS t(name, slug, brand, description, ingredients, how_to_use, price, sale_price, stock, category_id, image_url, featured, is_new, rating, review_count);

INSERT INTO public.promo_codes (code, description, discount_type, discount_value, min_order, active) VALUES
  ('WELCOME10', '10% off your first order', 'percent', 10, 0, true),
  ('GLOW20', '20% off orders over $80', 'percent', 20, 80, true),
  ('FREESHIP', '$10 off shipping', 'fixed', 10, 50, true);