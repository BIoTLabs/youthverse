
CREATE TABLE public.platform_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read config" ON public.platform_config
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'national_admin'::app_role));

CREATE TABLE public.custodial_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  address TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.custodial_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own wallet" ON public.custodial_wallets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
