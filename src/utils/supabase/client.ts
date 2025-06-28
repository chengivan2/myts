import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing')
    console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')
  }
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey
    })
    throw new Error(
      `Missing Supabase environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}`
    )
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
