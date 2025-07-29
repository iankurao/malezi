-- Create initial channels for Malezi Community
INSERT INTO public.channels (name, description, color) VALUES
('General Discussion', 'Welcome! Introduce yourself and discuss general topics about inclusive education', '#6366f1'),
('Special Needs Resources', 'Share and discover resources for children with special needs', '#10b981'),
('Parent Support', 'A space for parents to connect, share experiences and support each other', '#f59e0b'),
('Teacher Training', 'Professional development and teaching strategies for inclusive classrooms', '#8b5cf6'),
('Health & Therapy', 'Medical insights, therapy techniques, and health-related discussions', '#ef4444'),
('Success Stories', 'Celebrate achievements and share inspiring stories', '#06b6d4'),
('Policy & Advocacy', 'Discuss education policies and advocacy efforts in Kenya', '#84cc16'),
('Technology & Tools', 'Digital tools and assistive technology for learning', '#f97316');

-- Update existing users to admin role (for development/testing)
UPDATE public.profiles 
SET role = 'admin' 
WHERE role != 'admin';