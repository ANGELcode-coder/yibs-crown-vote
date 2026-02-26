
-- Fix contestants SELECT policy: must be PERMISSIVE to grant access
DROP POLICY "Contestants are publicly readable" ON public.contestants;
CREATE POLICY "Contestants are publicly readable"
  ON public.contestants
  FOR SELECT
  USING (true);

-- Fix voting_sessions SELECT policy
DROP POLICY "Public can read voting sessions" ON public.voting_sessions;
CREATE POLICY "Public can read voting sessions"
  ON public.voting_sessions
  FOR SELECT
  USING (true);
