
-- 1. Fix profiles: restrict full SELECT to own profile only, admins see all
DROP POLICY IF EXISTS "Public profiles readable" ON public.profiles;

CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'national_admin'));

-- 2. Create a security definer function for public profile data (no PII)
CREATE OR REPLACE FUNCTION public.get_public_profile(_user_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'full_name', p.full_name,
    'bio', p.bio,
    'state', p.state,
    'lga', p.lga,
    'avatar_url', p.avatar_url,
    'affiliations', p.affiliations,
    'zlto_balance', p.zlto_balance,
    'on_chain_reputation', p.on_chain_reputation,
    'wallet_address', p.wallet_address,
    'created_at', p.created_at
  )
  FROM public.profiles p
  WHERE p.user_id = _user_id
  LIMIT 1;
$$;

-- 3. Restrict gigs to authenticated users only
DROP POLICY IF EXISTS "Gigs readable" ON public.gigs;
CREATE POLICY "Gigs readable by authenticated"
  ON public.gigs FOR SELECT TO authenticated
  USING (true);

-- 4. Restrict courses to authenticated users
DROP POLICY IF EXISTS "Courses readable" ON public.courses;
CREATE POLICY "Courses readable by authenticated"
  ON public.courses FOR SELECT TO authenticated
  USING (true);

-- 5. Restrict green_projects to authenticated
DROP POLICY IF EXISTS "Projects readable" ON public.green_projects;
CREATE POLICY "Projects readable by authenticated"
  ON public.green_projects FOR SELECT TO authenticated
  USING (true);

-- 6. Restrict marketplace to authenticated
DROP POLICY IF EXISTS "Marketplace readable" ON public.marketplace_items;
CREATE POLICY "Marketplace readable by authenticated"
  ON public.marketplace_items FOR SELECT TO authenticated
  USING (true);
