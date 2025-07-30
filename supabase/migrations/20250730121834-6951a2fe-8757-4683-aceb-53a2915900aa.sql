-- Create resources table for E-Aware Parenting library
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT NOT NULL, -- 'pdf', 'video', 'audio', 'image', 'link'
  category TEXT NOT NULL DEFAULT 'general', -- 'parenting', 'education', 'health', 'development', 'general'
  tags TEXT[],
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies for resources
CREATE POLICY "Resources are viewable by everyone" 
ON public.resources 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can create resources" 
ON public.resources 
FOR INSERT 
WITH CHECK ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can update resources" 
ON public.resources 
FOR UPDATE 
USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete resources" 
ON public.resources 
FOR DELETE 
USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for resource files
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

-- Create storage policies for resource uploads
CREATE POLICY "Resource files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resources');

CREATE POLICY "Admins can upload resource files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resources' AND (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update resource files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'resources' AND (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete resource files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'resources' AND (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');

-- Insert some mock data for E-Aware Parenting resources
INSERT INTO public.resources (title, description, file_type, category, tags, created_by) VALUES 
(
  'Understanding Special Needs in Children',
  'A comprehensive guide for parents on identifying and supporting children with special educational needs.',
  'pdf',
  'education',
  ARRAY['special needs', 'early intervention', 'parenting'],
  '00000000-0000-0000-0000-000000000000'
),
(
  'Inclusive Parenting Strategies',
  'Practical strategies for creating an inclusive environment at home for children of all abilities.',
  'video',
  'parenting',
  ARRAY['inclusion', 'diversity', 'family'],
  '00000000-0000-0000-0000-000000000000'
),
(
  'Early Childhood Development Milestones',
  'Track your child''s development with this comprehensive milestone checklist.',
  'pdf',
  'development',
  ARRAY['milestones', 'assessment', 'early childhood'],
  '00000000-0000-0000-0000-000000000000'
),
(
  'Communication Techniques for Non-Verbal Children',
  'Learn effective communication strategies for children who are non-verbal or have communication challenges.',
  'video',
  'education',
  ARRAY['communication', 'non-verbal', 'strategies'],
  '00000000-0000-0000-0000-000000000000'
),
(
  'Building Self-Esteem in Children with Disabilities',
  'Tips and activities to help build confidence and self-worth in children with various disabilities.',
  'pdf',
  'development',
  ARRAY['self-esteem', 'confidence', 'disabilities'],
  '00000000-0000-0000-0000-000000000000'
),
(
  'Navigating the Kenyan Education System',
  'A parent''s guide to understanding inclusive education policies and rights in Kenya.',
  'pdf',
  'education',
  ARRAY['Kenya', 'education system', 'rights'],
  '00000000-0000-0000-0000-000000000000'
)