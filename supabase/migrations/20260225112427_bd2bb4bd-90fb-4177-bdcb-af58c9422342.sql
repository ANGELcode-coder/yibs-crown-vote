
-- Create category enum
CREATE TYPE public.contest_category AS ENUM ('miss', 'master');

-- Contestants table
CREATE TABLE public.contestants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT,
  category contest_category NOT NULL,
  bio TEXT,
  tagline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contestants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contestants are publicly readable"
  ON public.contestants FOR SELECT
  USING (true);

-- Voters table (phone verification)
CREATE TABLE public.voters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  otp_code TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  otp_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;

-- No direct public access to voters - managed via edge functions only
CREATE POLICY "No direct voter access"
  ON public.voters FOR SELECT
  USING (false);

-- Votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID NOT NULL REFERENCES public.voters(id) ON DELETE CASCADE,
  contestant_id UUID NOT NULL REFERENCES public.contestants(id) ON DELETE CASCADE,
  category contest_category NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(voter_id, category)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- No direct public access to votes - managed via edge functions
CREATE POLICY "No direct vote access"
  ON public.votes FOR SELECT
  USING (false);

-- View for vote counts (public)
CREATE VIEW public.contestant_votes AS
  SELECT contestant_id, COUNT(*) as vote_count
  FROM public.votes
  GROUP BY contestant_id;
