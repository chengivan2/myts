-- Fix Organizations RLS and Functions
-- Run this script in Supabase SQL Editor

-- 1. Enable RLS on all tables (if not already enabled)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view organizations they are members of" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organization owners can update organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Users can create organization memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owners can manage memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view domains for their organizations" ON public.organization_domains;
DROP POLICY IF EXISTS "Organization owners can manage domains" ON public.organization_domains;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- 3. Create comprehensive RLS policies

-- Organizations policies
CREATE POLICY "Users can view organizations they are members of" ON public.organizations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.organization_members 
            WHERE organization_id = organizations.id
        )
    );

CREATE POLICY "Authenticated users can create organizations" ON public.organizations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organization owners can update organization" ON public.organizations
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.organization_members 
            WHERE organization_id = organizations.id 
            AND role = 'owner'
        )
    );

-- Organization members policies
CREATE POLICY "Users can view their memberships" ON public.organization_members
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT user_id FROM public.organization_members AS om2 
            WHERE om2.organization_id = organization_members.organization_id 
            AND om2.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Authenticated users can create memberships" ON public.organization_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organization owners can manage memberships" ON public.organization_members
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.organization_members AS om2 
            WHERE om2.organization_id = organization_members.organization_id 
            AND om2.role = 'owner'
        )
    );

-- Organization domains policies
CREATE POLICY "Users can view domains for their organizations" ON public.organization_domains
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.organization_members 
            WHERE organization_id = organization_domains.organization_id
        )
    );

CREATE POLICY "Organization owners can manage domains" ON public.organization_domains
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.organization_members 
            WHERE organization_id = organization_domains.organization_id 
            AND role IN ('owner', 'admin')
        )
    );

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Tickets policies (for organization members)
CREATE POLICY "Organization members can view organization tickets" ON public.tickets
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.organization_members 
            WHERE organization_id = tickets.organization_id
        )
    );

CREATE POLICY "Organization members can manage tickets" ON public.tickets
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.organization_members 
            WHERE organization_id = tickets.organization_id
        )
    );

-- Ticket responses policies
CREATE POLICY "Organization members can view ticket responses" ON public.ticket_responses
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.organization_members 
            WHERE organization_id = (
                SELECT organization_id FROM public.tickets 
                WHERE id = ticket_responses.ticket_id
            )
        )
    );

CREATE POLICY "Organization members can manage ticket responses" ON public.ticket_responses
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.organization_members 
            WHERE organization_id = (
                SELECT organization_id FROM public.tickets 
                WHERE id = ticket_responses.ticket_id
            )
        )
    );

-- 4. Create helper functions

-- Function to check subdomain availability
CREATE OR REPLACE FUNCTION public.check_subdomain_availability(subdomain_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    existing_count integer;
    result json;
BEGIN
    -- Check if subdomain exists (case insensitive)
    SELECT COUNT(*) INTO existing_count
    FROM public.organizations
    WHERE LOWER(subdomain) = LOWER(subdomain_input);
    
    -- Return result as JSON
    IF existing_count = 0 THEN
        result := json_build_object('available', true, 'message', 'Subdomain is available');
    ELSE
        result := json_build_object('available', false, 'message', 'Subdomain is already taken');
    END IF;
    
    RETURN result;
END;
$$;

-- Function to atomically create organization with owner
CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
    org_name text,
    org_subdomain text,
    org_profile json DEFAULT NULL,
    org_logo_url text DEFAULT NULL,
    owner_user_id uuid DEFAULT auth.uid()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_org_id uuid;
    result json;
BEGIN
    -- Check if user is authenticated
    IF owner_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    -- Check if subdomain is available
    IF EXISTS (SELECT 1 FROM public.organizations WHERE LOWER(subdomain) = LOWER(org_subdomain)) THEN
        RAISE EXCEPTION 'Subdomain is already taken';
    END IF;
    
    -- Insert organization
    INSERT INTO public.organizations (name, subdomain, profile, logo_url)
    VALUES (org_name, org_subdomain, org_profile, org_logo_url)
    RETURNING id INTO new_org_id;
    
    -- Insert owner membership
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, owner_user_id, 'owner');
    
    -- Return success result
    result := json_build_object(
        'success', true,
        'organization_id', new_org_id,
        'message', 'Organization created successfully'
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return error result
        result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to create organization'
        );
        RETURN result;
END;
$$;

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 6. Ensure auth.users trigger exists to sync users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Update storage bucket policies for organization-logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'organization-logos',
    'organization-logos',
    true,
    5242880, -- 5MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

-- Storage policies for organization logos
DROP POLICY IF EXISTS "Organization members can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view organization logos" ON storage.objects;

CREATE POLICY "Organization members can upload logos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'organization-logos' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Organization members can update logos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'organization-logos' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Anyone can view organization logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'organization-logos');

-- Add RLS to storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Final verification queries (run these to check everything is working)
-- SELECT * FROM public.check_subdomain_availability('test-org');
-- SELECT auth.uid(); -- Should return your user ID when authenticated
