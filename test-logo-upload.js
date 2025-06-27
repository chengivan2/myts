// Test script to diagnose logo upload issues
// Run this in browser console on your app to test

async function testLogoUpload() {
  console.log('Testing logo upload functionality...')
  
  // Create a test file
  const testFile = new File(['test content'], 'test-logo.png', { type: 'image/png' })
  
  try {
    // Check if we can access supabase
    const { createClient } = await import('./src/utils/supabase/client.js')
    const supabase = createClient()
    
    console.log('✓ Supabase client created')
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('❌ Auth error:', authError)
      return
    }
    console.log('✓ User authenticated:', user?.email)
    
    // List all buckets
    const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets()
    if (bucketListError) {
      console.error('❌ Error listing buckets:', bucketListError)
    } else {
      console.log('📁 Available buckets:', buckets.map(b => b.name))
    }
    
    // Check if organization-logos bucket exists
    const orgLogosBucket = buckets?.find(b => b.name === 'organization-logos')
    if (!orgLogosBucket) {
      console.error('❌ organization-logos bucket does not exist!')
      console.log('Creating bucket...')
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('organization-logos', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError)
        return
      }
      console.log('✓ Bucket created:', newBucket)
    } else {
      console.log('✓ organization-logos bucket exists')
    }
    
    // Test upload
    console.log('Testing file upload...')
    const fileName = `test-${Date.now()}.png`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('organization-logos')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return
    }
    
    console.log('✓ Upload successful:', uploadData)
    
    // Test getting public URL
    const { data: { publicUrl } } = supabase.storage
      .from('organization-logos')
      .getPublicUrl(fileName)
    
    console.log('✓ Public URL generated:', publicUrl)
    
    // Test if URL is accessible
    try {
      const response = await fetch(publicUrl)
      if (response.ok) {
        console.log('✓ File is accessible via public URL')
      } else {
        console.error('❌ File not accessible via public URL, status:', response.status)
      }
    } catch (fetchError) {
      console.error('❌ Error fetching public URL:', fetchError)
    }
    
    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('organization-logos')
      .remove([fileName])
    
    if (deleteError) {
      console.warn('⚠️ Could not delete test file:', deleteError)
    } else {
      console.log('✓ Test file cleaned up')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testLogoUpload()
