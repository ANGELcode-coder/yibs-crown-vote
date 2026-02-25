
-- Fix security definer view by using security_invoker
DROP VIEW IF EXISTS public.contestant_votes;
CREATE VIEW public.contestant_votes
WITH (security_invoker = on) AS
  SELECT contestant_id, COUNT(*) as vote_count
  FROM public.votes
  GROUP BY contestant_id;
