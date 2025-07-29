-- First, let's check if we have any users to use as creators
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Try to get an existing user
    SELECT user_id INTO admin_user_id FROM public.profiles LIMIT 1;
    
    -- If we have a user, use them as creator, otherwise use a default UUID
    IF admin_user_id IS NOT NULL THEN
        -- Create initial channels for Malezi Community with existing user
        INSERT INTO public.channels (name, description, color, created_by) VALUES
        ('General Discussion', 'Welcome! Introduce yourself and discuss general topics about inclusive education', '#6366f1', admin_user_id),
        ('Special Needs Resources', 'Share and discover resources for children with special needs', '#10b981', admin_user_id),
        ('Parent Support', 'A space for parents to connect, share experiences and support each other', '#f59e0b', admin_user_id),
        ('Teacher Training', 'Professional development and teaching strategies for inclusive classrooms', '#8b5cf6', admin_user_id),
        ('Health & Therapy', 'Medical insights, therapy techniques, and health-related discussions', '#ef4444', admin_user_id),
        ('Success Stories', 'Celebrate achievements and share inspiring stories', '#06b6d4', admin_user_id),
        ('Policy & Advocacy', 'Discuss education policies and advocacy efforts in Kenya', '#84cc16', admin_user_id),
        ('Technology & Tools', 'Digital tools and assistive technology for learning', '#f97316', admin_user_id);
    ELSE
        -- Temporarily make created_by nullable for seed data
        ALTER TABLE public.channels ALTER COLUMN created_by DROP NOT NULL;
        
        -- Create initial channels for Malezi Community without creator
        INSERT INTO public.channels (name, description, color) VALUES
        ('General Discussion', 'Welcome! Introduce yourself and discuss general topics about inclusive education', '#6366f1'),
        ('Special Needs Resources', 'Share and discover resources for children with special needs', '#10b981'),
        ('Parent Support', 'A space for parents to connect, share experiences and support each other', '#f59e0b'),
        ('Teacher Training', 'Professional development and teaching strategies for inclusive classrooms', '#8b5cf6'),
        ('Health & Therapy', 'Medical insights, therapy techniques, and health-related discussions', '#ef4444'),
        ('Success Stories', 'Celebrate achievements and share inspiring stories', '#06b6d4'),
        ('Policy & Advocacy', 'Discuss education policies and advocacy efforts in Kenya', '#84cc16'),
        ('Technology & Tools', 'Digital tools and assistive technology for learning', '#f97316');
    END IF;
END $$;

-- Update existing users to admin role (for development/testing)
UPDATE public.profiles 
SET role = 'admin' 
WHERE role != 'admin';