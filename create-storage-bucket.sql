-- Create organization-logos storage bucket
-- Run this in Supabase SQL Editor

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-logos',
  'organization-logos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Ensure the bucket is public (no RLS policies needed for public buckets)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'organization-logos';

-- Optional: If you want to add RLS policies for more security, uncomment below
-- But since you mentioned buckets are public, this isn't necessary

/*
-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'organization-logos');

-- Create policy to allow public access to files (since bucket is public)
CREATE POLICY "Allow public access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'organization-logos');

-- Create policy to allow users to update their organization logos
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'organization-logos');

-- Create policy to allow users to delete their organization logos
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'organization-logos');
*/
