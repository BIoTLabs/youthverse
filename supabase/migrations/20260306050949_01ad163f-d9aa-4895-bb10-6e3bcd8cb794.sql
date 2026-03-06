
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS url text;

ALTER TABLE public.skill_completions ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.skill_completions ADD COLUMN IF NOT EXISTS credential_hash text;
