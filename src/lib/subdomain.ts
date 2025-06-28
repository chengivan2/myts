/**
 * Utility functions for handling subdomain-based routing
 */

export function getSubdomain(hostname: string): string | null {
  // Remove www. if present
  const cleanHostname = hostname.replace(/^www\./, '')
  
  // Split by dots
  const parts = cleanHostname.split('.')
  
  // If we have at least 3 parts (subdomain.domain.tld), extract subdomain
  if (parts.length >= 3) {
    // Check if it's our domain structure: {subdomain}.myticketingsysem.site
    if (parts.slice(-2).join('.') === 'myticketingsysem.site') {
      return parts[0]
    }
  }
  
  // For development, handle localhost:3000 scenarios
  if (hostname.includes('localhost') && parts.length >= 2) {
    // Handle subdomain.localhost:3000
    if (parts[0] !== 'localhost' && !parts[0].includes('localhost')) {
      return parts[0]
    }
  }
  
  return null
}

export function isRootDomain(hostname: string): boolean {
  const cleanHostname = hostname.replace(/^www\./, '')
  
  // Check if it's the root domain
  return cleanHostname === 'myticketingsysem.site' || 
         cleanHostname.includes('localhost') && !getSubdomain(hostname)
}

export function getOrganizationFromSubdomain(subdomain: string | null) {
  if (!subdomain) return null
  
  // Reserved subdomains that shouldn't be treated as organizations
  const reservedSubdomains = [
    'www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 
    'support', 'help', 'docs', 'status', 'staging', 'dev'
  ]
  
  if (reservedSubdomains.includes(subdomain.toLowerCase())) {
    return null
  }
  
  return subdomain
}

