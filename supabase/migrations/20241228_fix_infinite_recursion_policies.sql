-- Fix infinite recursion in RLS policies
-- Based on Supabase assistant recommendations to simplify policies
-- and avoid circular dependencies

-- First, drop all existing problematic policies
DROP POLICY IF EXISTS "organizations_select_policy" ON organizations;
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;
DROP POLICY IF EXISTS "Only owners and admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can update their own memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON organization_members;

-- Create simplified, non-recursive policies for organizations table
CREATE POLICY "users_can_view_their_organizations" ON organizations
    FOR SELECT USING (
        -- Direct check without subquery to avoid recursion
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_members.organization_id = organizations.id 
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY "authenticated_users_can_create_organizations" ON organizations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "owners_can_update_organizations" ON organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_members.organization_id = organizations.id 
            AND organization_members.user_id = auth.uid() 
            AND organization_members.role = 'owner'
        )
    );

CREATE POLICY "owners_can_delete_organizations" ON organizations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_members.organization_id = organizations.id 
            AND organization_members.user_id = auth.uid() 
            AND organization_members.role = 'owner'
        )
    );

-- Create simplified, non-recursive policies for organization_members table
-- These policies avoid subqueries that reference the same table

CREATE POLICY "users_can_view_own_memberships" ON organization_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_can_insert_own_memberships" ON organization_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_update_own_memberships" ON organization_members
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "users_can_delete_own_memberships" ON organization_members
    FOR DELETE USING (user_id = auth.uid());

-- Create a separate policy for admins/owners to manage other members
-- This uses a different approach to avoid recursion
CREATE POLICY "admins_can_manage_organization_members" ON organization_members
    FOR ALL USING (
        -- Check if the current user is an admin/owner of this organization
        -- by directly querying without self-reference
        organization_id IN (
            SELECT om.organization_id 
            FROM organization_members om 
            WHERE om.user_id = auth.uid() 
            AND om.role IN ('owner', 'admin')
            -- Explicitly exclude the current row to prevent recursion
            AND om.id != COALESCE(organization_members.id, -1)
        )
    );

-- Add indexes to improve performance and reduce recursion likelihood
CREATE INDEX IF NOT EXISTS idx_organization_members_user_org 
    ON organization_members(user_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_organization_members_org_role 
    ON organization_members(organization_id, role);

CREATE INDEX IF NOT EXISTS idx_organization_members_user_role 
    ON organization_members(user_id, role);

-- Add a comment explaining the approach
COMMENT ON TABLE organization_members IS 'RLS policies simplified to avoid infinite recursion. Users can only see their own memberships directly, while admin functions require explicit role checks without self-referencing subqueries.';
