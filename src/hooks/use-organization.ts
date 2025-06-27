"use client"

import { useEffect, useState } from 'react'

interface Organization {
  id: string
  name: string
  subdomain: string
  profile?: any
}

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isSubdomain, setIsSubdomain] = useState(false)

  useEffect(() => {
    // Check if we're on a subdomain
    const hostname = window.location.hostname
    const subdomain = hostname.split('.')[0]
    
    if (subdomain && subdomain !== 'myticketingsysem' && subdomain !== 'www') {
      setIsSubdomain(true)
      
      // Extract organization data from headers if available
      // Note: In a real implementation, you'd fetch this from your API
      const orgId = document.querySelector('meta[name="x-organization-id"]')?.getAttribute('content')
      const orgName = document.querySelector('meta[name="x-organization-name"]')?.getAttribute('content')
      
      if (orgId && orgName) {
        setOrganization({
          id: orgId,
          name: orgName,
          subdomain: subdomain
        })
      }
    } else {
      setIsSubdomain(false)
      setOrganization(null)
    }
  }, [])

  return {
    organization,
    isSubdomain,
    subdomain: organization?.subdomain
  }
}
