-- Skin Quiz Results
CREATE TABLE public.skin_quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skin_type TEXT NOT NULL,
  concerns TEXT[] NOT NULL DEFAULT '{}',
  goals TEXT[] NOT NULL DEFAULT '{}',
  age_range TEXT,
  sensitivity TEXT,
  ai_analysis TEXT,
  recommended_product_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skin_quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own quiz" ON public.skin_quiz_results FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Loyalty Points
CREATE TABLE public.loyalty_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'silver',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own points" ON public.loyalty_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage points" ON public.loyalty_points FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  order_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transactions" ON public.loyalty_transactions FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage transactions" ON public.loyalty_transactions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Bundles
CREATE TABLE public.bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  discount_percent NUMERIC NOT NULL DEFAULT 10,
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bundles public read" ON public.bundles FOR SELECT USING (active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage bundles" ON public.bundles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.bundle_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0
);
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bundle items public read" ON public.bundle_items FOR SELECT USING (true);
CREATE POLICY "Admins manage bundle items" ON public.bundle_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Auto-create loyalty record on signup
CREATE OR REPLACE FUNCTION public.create_loyalty_record()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.loyalty_points (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_loyalty ON auth.users;
CREATE TRIGGER on_auth_user_created_loyalty
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_loyalty_record();

-- Backfill loyalty for existing users
INSERT INTO public.loyalty_points (user_id)
SELECT id FROM auth.users ON CONFLICT DO NOTHING;

-- Sample bundles
INSERT INTO public.bundles (name, slug, description, discount_percent, featured, image_url) VALUES
  ('Glass Skin Ritual', 'glass-skin-ritual', 'The complete 5-step routine for luminous, dewy skin.', 15, true, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=85'),
  ('Hydration Heroes', 'hydration-heroes', 'Plump, quench, and lock in moisture with three iconic essences.', 12, true, 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800&q=85'),
  ('Night Repair Set', 'night-repair-set', 'Wake up to renewed, radiant skin every morning.', 10, false, 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=85');