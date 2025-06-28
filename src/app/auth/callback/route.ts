import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/auth/verified'
  const redirect = searchParams.get('redirect') // Where they were trying to go before signup

  // Debug logging
  console.log('Auth callback - Request URL:', request.url)
  console.log('Auth callback - Code present:', !!code)
  console.log('Auth callback - Token hash present:', !!token_hash)
  console.log('Auth callback - Type:', type)
  console.log('Auth callback - Next:', next)
  console.log('Auth callback - Redirect:', redirect)
  console.log('Auth callback - Origin:', origin)

  const supabase = await createClient()

  // Handle OAuth code flow (third-party providers)
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('Auth callback - OAuth exchange result error:', error)
      
      if (!error) {
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        // Include redirect parameter in the verified page URL if it exists
        const nextUrl = redirect ? `${next}?redirect=${encodeURIComponent(redirect)}` : next
        
        console.log('Auth callback - OAuth Final redirect URL:', nextUrl)
        console.log('Auth callback - Is local env:', isLocalEnv)
        console.log('Auth callback - Forwarded host:', forwardedHost)
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${nextUrl}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${nextUrl}`)
        } else {
          return NextResponse.redirect(`${origin}${nextUrl}`)
        }
      } else {
        console.error('Auth callback - OAuth Session exchange failed:', error)
      }
    } catch (error) {
      console.error('Auth callback OAuth error:', error)
    }
  }
  
  // Handle email verification flow
  if (token_hash && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      })
      
      console.log('Auth callback - Email verification result error:', error)
      
      if (!error) {
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        // Include redirect parameter in the verified page URL if it exists
        const nextUrl = redirect ? `${next}?redirect=${encodeURIComponent(redirect)}` : next
        
        console.log('Auth callback - Email verification Final redirect URL:', nextUrl)
        console.log('Auth callback - Is local env:', isLocalEnv)
        console.log('Auth callback - Forwarded host:', forwardedHost)
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${nextUrl}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${nextUrl}`)
        } else {
          return NextResponse.redirect(`${origin}${nextUrl}`)
        }
      } else {
        console.error('Auth callback - Email verification failed:', error)
      }
    } catch (error) {
      console.error('Auth callback email verification error:', error)
    }
  }

  // If we reach here, neither code nor token_hash worked
  if (!code && !token_hash) {
    console.log('Auth callback - No code or token_hash parameter found')
  }

  // Return the user to an error page with instructions
  console.log('Auth callback - Redirecting to error page')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
