-- Fix security vulnerability: Restrict profile access to authenticated users only
-- This prevents anonymous users from accessing personal information while maintaining
-- functionality for authenticated community members

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);