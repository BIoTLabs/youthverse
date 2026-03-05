
-- Fix: zlto_transactions INSERT should only be done by authenticated users
DROP POLICY "System inserts txns" ON public.zlto_transactions;
CREATE POLICY "Authenticated insert txns" ON public.zlto_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
