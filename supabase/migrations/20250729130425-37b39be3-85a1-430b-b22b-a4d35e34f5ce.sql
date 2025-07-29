-- Add public field to channels table
ALTER TABLE public.channels ADD COLUMN public boolean NOT NULL DEFAULT true;

-- Update RLS policies for channels
DROP POLICY IF EXISTS "Channels are viewable by everyone" ON public.channels;
DROP POLICY IF EXISTS "Authenticated users can create channels" ON public.channels;

-- New policy: Public channels are viewable by everyone, private channels only by admins
CREATE POLICY "Public channels are viewable by everyone" 
ON public.channels 
FOR SELECT 
USING (public = true OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');

-- Only admins can create channels
CREATE POLICY "Only admins can create channels" 
ON public.channels 
FOR INSERT 
WITH CHECK ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');

-- Only admins can update channels
CREATE POLICY "Only admins can update channels" 
ON public.channels 
FOR UPDATE 
USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');

-- Only admins can delete channels
CREATE POLICY "Only admins can delete channels" 
ON public.channels 
FOR DELETE 
USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');

-- Reset all users to 'parent' role first
UPDATE public.profiles SET role = 'parent';

-- Set only the first user (by creation date) as admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
    SELECT id 
    FROM public.profiles 
    ORDER BY created_at ASC 
    LIMIT 1
);