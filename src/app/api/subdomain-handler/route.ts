import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const hostname = request.headers.get('host') || ''
  const path = url.searchParams.get('path') || ''
  
  // Extract subdomain
  const subdomain = hostname.split('.')[0]
  
  // If it's the main domain (no subdomain or www)
  if (subdomain === 'myticketingsysem' || subdomain === 'www' || !subdomain.includes('.')) {
    return NextResponse.rewrite(new URL(`/${path}`, request.url))
  }
  
  // Handle subdomain routing
  try {
    const supabase = await createClient()
    
    // Find organization by subdomain
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('id, name, subdomain, profile')
      .eq('subdomain', subdomain)
      .single()
    
    if (error || !organization) {
      // Organization not found - show 404 or redirect to main site
      return NextResponse.rewrite(new URL('/org/not-found', request.url))
    }
    
    // Organization exists - route to organization-specific pages
    const orgPath = `/org/${organization.id}/${path}`
    
    // Pass organization data as headers for the app to use
    const response = NextResponse.rewrite(new URL(orgPath, request.url))
    response.headers.set('x-organization-id', organization.id)
    response.headers.set('x-organization-name', organization.name)
    response.headers.set('x-organization-subdomain', organization.subdomain)
    
    return response
    
  } catch (error) {
    console.error('Subdomain handler error:', error)
    return NextResponse.rewrite(new URL('/org/error', request.url))
  }
}
