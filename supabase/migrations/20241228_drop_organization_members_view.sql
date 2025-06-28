-- Drop the organization_members_view that was causing complexity
-- This view was created to allow admin queries but is no longer needed
-- as we've simplified the RLS policies to be non-recursive

DROP VIEW IF EXISTS organization_members_view;
