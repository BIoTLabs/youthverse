
-- Create enum types
CREATE TYPE public.app_role AS ENUM ('youth', 'admin', 'employer', 'partner', 'national_admin');
CREATE TYPE public.gig_status AS ENUM ('open', 'applied', 'in_progress', 'completed', 'verified', 'disputed');
CREATE TYPE public.tree_status AS ENUM ('submitted', 'verified', 'rejected', 'alive', 'dead');
CREATE TYPE public.zlto_tx_type AS ENUM ('skill_reward', 'gig_reward', 'tree_reward', 'tree_survival_bonus', 'redemption', 'carbon_credit_distribution', 'escrow_deposit', 'escrow_release');

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  state TEXT,
  lga TEXT,
  date_of_birth DATE,
  bio TEXT,
  affiliations TEXT[] DEFAULT '{}',
  wallet_address TEXT,
  zlto_balance NUMERIC DEFAULT 0,
  on_chain_reputation JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_ts BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  program TEXT,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'national_admin'));

-- Skills / Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT DEFAULT 'NiYA Academy',
  zlto_reward NUMERIC DEFAULT 50,
  category TEXT,
  duration_hours INTEGER,
  completion_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses readable" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'national_admin'));

-- Skill completions
CREATE TABLE public.skill_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) NOT NULL,
  completion_code TEXT,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  tx_hash TEXT,
  zlto_awarded NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ
);
ALTER TABLE public.skill_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own completions" ON public.skill_completions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users submit completions" ON public.skill_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins verify completions" ON public.skill_completions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Gigs table
CREATE TABLE public.gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  employer_id UUID REFERENCES auth.users(id),
  category TEXT,
  location TEXT,
  state TEXT,
  budget NUMERIC,
  zlto_reward NUMERIC DEFAULT 100,
  status gig_status DEFAULT 'open',
  is_escrow BOOLEAN DEFAULT false,
  escrow_milestones JSONB DEFAULT '[]',
  deadline TIMESTAMPTZ,
  skills_required TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gigs readable" ON public.gigs FOR SELECT USING (true);
CREATE POLICY "Employers manage gigs" ON public.gigs FOR ALL USING (auth.uid() = employer_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_gigs_ts BEFORE UPDATE ON public.gigs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Gig applications
CREATE TABLE public.gig_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES public.gigs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cover_letter TEXT,
  status gig_status DEFAULT 'applied',
  tx_hash TEXT,
  zlto_awarded NUMERIC DEFAULT 0,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gig_id, user_id)
);
ALTER TABLE public.gig_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own apps" ON public.gig_applications FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR auth.uid() = (SELECT employer_id FROM public.gigs WHERE id = gig_id));
CREATE POLICY "Users apply" ON public.gig_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Status updates" ON public.gig_applications FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR auth.uid() = (SELECT employer_id FROM public.gigs WHERE id = gig_id));
CREATE TRIGGER update_gig_apps_ts BEFORE UPDATE ON public.gig_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Green projects
CREATE TABLE public.green_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  state TEXT,
  lga TEXT,
  program TEXT,
  target_trees INTEGER DEFAULT 1000,
  zlto_per_tree NUMERIC DEFAULT 10,
  survival_bonus_zlto NUMERIC DEFAULT 5,
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.green_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects readable" ON public.green_projects FOR SELECT USING (true);
CREATE POLICY "Admins manage projects" ON public.green_projects FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'national_admin'));
CREATE TRIGGER update_green_ts BEFORE UPDATE ON public.green_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tree submissions
CREATE TABLE public.tree_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.green_projects(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  tree_species TEXT,
  status tree_status DEFAULT 'submitted',
  verified_by UUID REFERENCES auth.users(id),
  tx_hash TEXT,
  zlto_awarded NUMERIC DEFAULT 0,
  survival_checks JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.tree_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own trees" ON public.tree_submissions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users submit trees" ON public.tree_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins verify trees" ON public.tree_submissions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_trees_ts BEFORE UPDATE ON public.tree_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Carbon credit batches
CREATE TABLE public.carbon_credit_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  state TEXT,
  tree_count INTEGER,
  estimated_co2_tons NUMERIC,
  status TEXT DEFAULT 'draft',
  sale_price NUMERIC,
  sale_date TIMESTAMPTZ,
  buyer TEXT,
  zlto_distributed NUMERIC DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.carbon_credit_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Batches readable by admins" ON public.carbon_credit_batches FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'national_admin'));
CREATE POLICY "Admins manage batches" ON public.carbon_credit_batches FOR ALL USING (public.has_role(auth.uid(), 'national_admin'));

-- Zlto transactions ledger
CREATE TABLE public.zlto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  tx_type zlto_tx_type NOT NULL,
  reference_id UUID,
  tx_hash TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.zlto_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own txns" ON public.zlto_transactions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System inserts txns" ON public.zlto_transactions FOR INSERT WITH CHECK (true);

-- Marketplace items
CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  zlto_cost NUMERIC NOT NULL,
  partner TEXT,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Marketplace readable" ON public.marketplace_items FOR SELECT USING (true);
CREATE POLICY "Admins manage marketplace" ON public.marketplace_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Redemptions
CREATE TABLE public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.marketplace_items(id) NOT NULL,
  zlto_spent NUMERIC NOT NULL,
  voucher_code TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own redemptions" ON public.redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users redeem" ON public.redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'youth');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for tree photos
INSERT INTO storage.buckets (id, name, public) VALUES ('tree-photos', 'tree-photos', true);
CREATE POLICY "Anyone can view tree photos" ON storage.objects FOR SELECT USING (bucket_id = 'tree-photos');
CREATE POLICY "Auth users upload tree photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tree-photos' AND auth.uid() IS NOT NULL);
