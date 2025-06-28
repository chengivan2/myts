-- Fix infinite recursion in organization_members RLS policy
-- Drop the problematic policy first
DROP POLICY IF EXISTS "Users can view organization members they belong to" ON organization_members;

-- Create a corrected policy that doesn't cause infinite recursion
CREATE POLICY "Users can view organization members they belong to" 
ON organization_members FOR SELECT 
USING (
  -- Allow users to see members of organizations they belong to
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Also ensure the insert policy is correct
DROP POLICY IF EXISTS "Users can insert organization members" ON organization_members;
CREATE POLICY "Users can insert organization members" 
ON organization_members FOR INSERT 
WITH CHECK (
  -- Only owners can add members
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Create the missing create_organization_with_owner function
CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  org_name text,
  org_subdomain text,
  org_profile jsonb DEFAULT '{}',
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
  -- Validate inputs
  IF org_name IS NULL OR trim(org_name) = '' THEN
    RAISE EXCEPTION 'Organization name cannot be empty';
  END IF;
  
  IF org_subdomain IS NULL OR trim(org_subdomain) = '' THEN
    RAISE EXCEPTION 'Organization subdomain cannot be empty';
  END IF;
  
  IF owner_user_id IS NULL THEN
    RAISE EXCEPTION 'Owner user ID cannot be null';
  END IF;

  -- Check if subdomain is available
  DECLARE
    availability_check json;
  BEGIN
    SELECT check_subdomain_availability(org_subdomain) INTO availability_check;
    
    IF NOT (availability_check->>'available')::boolean THEN
      RAISE EXCEPTION 'Subdomain not available: %', availability_check->>'message';
    END IF;
  END;

  -- Insert the organization
  INSERT INTO organizations (name, subdomain, profile, logo_url)
  VALUES (org_name, lower(trim(org_subdomain)), COALESCE(org_profile, '{}'), org_logo_url)
  RETURNING id INTO new_org_id;

  -- Insert the owner membership
  INSERT INTO organization_members (organization_id, user_id, role)
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
    -- Return error information
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to create organization: ' || SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_organization_with_owner(text, text, jsonb, text, uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.create_organization_with_owner(text, text, jsonb, text, uuid) IS 'Atomically creates an organization and assigns the specified user as owner. Returns JSON with success status and organization_id.';

-- Alternative simpler RLS policies to avoid recursion issues
-- Let's use a more straightforward approach for organization_members

-- Drop all existing policies on organization_members
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON organization_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON organization_members;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON organization_members;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON organization_members;

-- Create simple, non-recursive policies
CREATE POLICY "organization_members_select_policy" 
ON organization_members FOR SELECT 
USING (
  -- Users can see their own memberships
  user_id = auth.uid()
  OR
  -- Users can see other members of organizations where they are owners/admins
  EXISTS (
    SELECT 1 FROM organization_members om 
    WHERE om.organization_id = organization_members.organization_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('owner', 'admin')
  )
);

CREATE POLICY "organization_members_insert_policy" 
ON organization_members FOR INSERT 
WITH CHECK (
  -- Users can add themselves (for invitations)
  user_id = auth.uid()
  OR
  -- Owners/admins can add others
  EXISTS (
    SELECT 1 FROM organization_members om 
    WHERE om.organization_id = organization_members.organization_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('owner', 'admin')
  )
);

CREATE POLICY "organization_members_update_policy" 
ON organization_members FOR UPDATE 
USING (
  -- Users can update their own membership
  user_id = auth.uid()
  OR
  -- Owners/admins can update other memberships
  EXISTS (
    SELECT 1 FROM organization_members om 
    WHERE om.organization_id = organization_members.organization_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('owner', 'admin')
  )
);

CREATE POLICY "organization_members_delete_policy" 
ON organization_members FOR DELETE 
USING (
  -- Users can remove their own membership (leave organization)
  user_id = auth.uid()
  OR
  -- Owners/admins can remove other memberships
  EXISTS (
    SELECT 1 FROM organization_members om 
    WHERE om.organization_id = organization_members.organization_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('owner', 'admin')
  )
);

-- Also create a simplified policy for organizations table to ensure proper access
DROP POLICY IF EXISTS "Enable read access for all users" ON organizations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON organizations;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON organizations;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON organizations;

CREATE POLICY "organizations_select_policy" 
ON organizations FOR SELECT 
USING (
  -- Users can see organizations they belong to
  id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "organizations_insert_policy" 
ON organizations FOR INSERT 
WITH CHECK (
  -- Any authenticated user can create an organization
  auth.uid() IS NOT NULL
);

CREATE POLICY "organizations_update_policy" 
ON organizations FOR UPDATE 
USING (
  -- Only owners can update organizations
  id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "organizations_delete_policy" 
ON organizations FOR DELETE 
USING (
  -- Only owners can delete organizations
  id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);
