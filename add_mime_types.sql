-- Update organization-logos bucket to allow image MIME types
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
]
WHERE id = 'organization-logos';

-- Update user-logos bucket to allow image MIME types  
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/jpg',
  'image/png', 
  'image/gif',
  'image/webp',
  'image/svg+xml'
]
WHERE id = 'user-logos';

-- Verify the updates
SELECT id, name, allowed_mime_types, public
FROM storage.buckets 
WHERE id IN ('organization-logos', 'user-logos');
