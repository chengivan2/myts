-- Fix Organization Creation with Proper RLS Policies and Membership Handling
-- This script addresses the chicken-and-egg problem with RLS policies and organization membership

-- First, let's recreate the check_subdomain_availability function with proper security
CREATE OR REPLACE FUNCTION check_subdomain_availability(subdomain_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_available boolean;
  result json;
BEGIN
  -- Check if subdomain exists in organizations table
  SELECT NOT EXISTS (
    SELECT 1 FROM organizations 
    WHERE LOWER(subdomain) = LOWER(subdomain_input)
  ) INTO is_available;
  
  -- Return JSON result
  result := json_build_object(
    'available', is_available,
    'subdomain', subdomain_input
  );
  
  RETURN result;
END;
$$;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION check_subdomain_availability(text) TO authenticated;

-- Now let's fix the RLS policies to handle the organization creation flow properly

-- Organizations table policies
DROP POLICY IF EXISTS "Users can view organizations they're members of" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can update organizations they own" ON organizations;

-- Allow authenticated users to create organizations
CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow users to view organizations they're members of
CREATE POLICY "Users can view organizations they're members of" ON organizations
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to update organizations they own
CREATE POLICY "Users can update organizations they own" ON organizations
  FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Organization members table policies
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Users can create organization memberships" ON organization_members;
DROP POLICY IF EXISTS "Owners can manage organization members" ON organization_members;

-- Allow users to view members of organizations they belong to
CREATE POLICY "Users can view organization members" ON organization_members
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to create organization memberships (needed for initial organization creation)
-- This is the key policy that fixes the chicken-and-egg problem
CREATE POLICY "Users can create organization memberships" ON organization_members
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Allow if creating membership for themselves
    user_id = auth.uid() OR
    -- Or if they're already an owner of the organization
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Allow owners to manage members of their organizations
CREATE POLICY "Owners can manage organization members" ON organization_members
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Organization domains table policies
DROP POLICY IF EXISTS "Users can view organization domains" ON organization_domains;
DROP POLICY IF EXISTS "Users can manage organization domains" ON organization_domains;

-- Allow users to view domains of organizations they belong to
CREATE POLICY "Users can view organization domains" ON organization_domains
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Allow owners to manage domains of their organizations
CREATE POLICY "Users can manage organization domains" ON organization_domains
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_domains ENABLE ROW LEVEL SECURITY;

-- Create helper function for organization creation to ensure atomic operation
CREATE OR REPLACE FUNCTION create_organization_with_owner(
  org_name text,
  org_subdomain text,
  org_profile jsonb DEFAULT NULL,
  org_logo_url text DEFAULT NULL,
  owner_user_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
  result json;
  target_user_id uuid;
BEGIN
  -- Use provided user_id or default to current user
  target_user_id := COALESCE(owner_user_id, auth.uid());
  
  -- Validate user is authenticated
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check if subdomain is available
  IF EXISTS (SELECT 1 FROM organizations WHERE LOWER(subdomain) = LOWER(org_subdomain)) THEN
    RAISE EXCEPTION 'Subdomain is not available';
  END IF;
  
  -- Create organization
  INSERT INTO organizations (name, subdomain, profile, logo_url)
  VALUES (org_name, org_subdomain, org_profile, org_logo_url)
  RETURNING id INTO new_org_id;
  
  -- Create organization membership for owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, target_user_id, 'owner');
  
  -- Return success result
  result := json_build_object(
    'success', true,
    'organization_id', new_org_id,
    'message', 'Organization created successfully'
  );
  
  RETURN result;
END;
$$;

-- Grant execute permissions on the helper function
GRANT EXECUTE ON FUNCTION create_organization_with_owner(text, text, jsonb, text, uuid) TO authenticated;

-- Test that the policies work correctly
-- You can uncomment these for testing purposes:
/*
SELECT check_subdomain_availability('test-subdomain');
SELECT create_organization_with_owner('Test Org', 'test-org-subdomain', '{"description": "Test"}', null, auth.uid());
*/

-- Final check: ensure all necessary permissions are granted
GRANT ALL ON organizations TO authenticated;
GRANT ALL ON organization_members TO authenticated;
GRANT ALL ON organization_domains TO authenticated;
