
-- 1. Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  interval_days INT NOT NULL DEFAULT 30,
  quantity INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  next_ship_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  discount_percent NUMERIC NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subs" ON public.subscriptions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view subs" ON public.subscriptions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_subs_updated BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  referred_count INT NOT NULL DEFAULT 0,
  reward_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own referral" ON public.referrals FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Public read by code" ON public.referrals FOR SELECT
  USING (true);
CREATE POLICY "Admins manage referrals" ON public.referrals FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Auto-generate referral code on signup
CREATE OR REPLACE FUNCTION public.create_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.referrals (user_id, code)
  VALUES (NEW.id, upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8)))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_user_create_referral
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_referral_code();

-- Backfill referrals for existing users
INSERT INTO public.referrals (user_id, code)
SELECT id, upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8))
FROM auth.users ON CONFLICT DO NOTHING;

-- 3. Daily check-ins
CREATE TABLE public.daily_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  streak INT NOT NULL DEFAULT 1,
  points_earned INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, check_in_date)
);
ALTER TABLE public.daily_check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own checkins" ON public.daily_check_ins FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Award points on check-in
CREATE OR REPLACE FUNCTION public.handle_check_in()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.loyalty_points
  SET points = points + NEW.points_earned,
      lifetime_points = lifetime_points + NEW.points_earned,
      updated_at = now()
  WHERE user_id = NEW.user_id;
  INSERT INTO public.loyalty_transactions(user_id, points, reason)
  VALUES (NEW.user_id, NEW.points_earned, 'Daily check-in #' || NEW.streak);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_checkin AFTER INSERT ON public.daily_check_ins
  FOR EACH ROW EXECUTE FUNCTION public.handle_check_in();

-- 4. Badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_key TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own badges" ON public.badges FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own badges" ON public.badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage badges" ON public.badges FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. Spin wheel
CREATE TABLE public.spin_wheel_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  spin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  prize_label TEXT NOT NULL,
  prize_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, spin_date)
);
ALTER TABLE public.spin_wheel_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own spins" ON public.spin_wheel_log FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_spin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.prize_points > 0 THEN
    UPDATE public.loyalty_points
    SET points = points + NEW.prize_points,
        lifetime_points = lifetime_points + NEW.prize_points,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    INSERT INTO public.loyalty_transactions(user_id, points, reason)
    VALUES (NEW.user_id, NEW.prize_points, 'Spin wheel: ' || NEW.prize_label);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_spin AFTER INSERT ON public.spin_wheel_log
  FOR EACH ROW EXECUTE FUNCTION public.handle_spin();

-- 6. User preferences (For You)
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  favorite_categories UUID[] DEFAULT '{}',
  favorite_brands TEXT[] DEFAULT '{}',
  skin_type TEXT,
  budget_range TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prefs" ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Product views (realtime)
CREATE TABLE public.product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  user_id UUID,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, session_id)
);
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone insert views" ON public.product_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone read views" ON public.product_views FOR SELECT USING (true);
CREATE POLICY "Anyone update own session" ON public.product_views FOR UPDATE USING (true);
CREATE INDEX idx_product_views_recent ON public.product_views (product_id, last_seen DESC);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;

-- Index helpers
CREATE INDEX idx_subs_next_ship ON public.subscriptions (next_ship_at) WHERE status = 'active';
CREATE INDEX idx_referrals_code ON public.referrals (code);
