
-- Create app_role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admins can view roles
CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Voting sessions table to control when voting is open
CREATE TABLE public.voting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.voting_sessions ENABLE ROW LEVEL SECURITY;

-- Public can read active sessions
CREATE POLICY "Public can read voting sessions"
  ON public.voting_sessions FOR SELECT
  USING (true);

-- Admins can manage sessions
CREATE POLICY "Admins can insert sessions"
  ON public.voting_sessions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sessions"
  ON public.voting_sessions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sessions"
  ON public.voting_sessions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage contestants
CREATE POLICY "Admins can insert contestants"
  ON public.contestants FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contestants"
  ON public.contestants FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contestants"
  ON public.contestants FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert a default active voting session
INSERT INTO public.voting_sessions (name, is_active) VALUES ('Miss & Master YIBS 2026', true);
