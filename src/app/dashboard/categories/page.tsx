"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { CategoryManagement } from "@/components/dashboard/category-management"
import { Card } from "@/components/ui/card"
import { Loader2, Building2 } from "lucide-react"

interface Organization {
  id: string
  name: string
  subdomain: string
  role: string
}

export default function CategoriesPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserOrganizations()
  }, [])

  const fetchUserOrganizations = async () => {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user's organizations where they have admin/owner access
      const { data: userOrgs } = await supabase
        .from('organization_members')
        .select(`
          role,
          organizations (
            id,
            name,
            subdomain
          )
        `)
        .eq('user_id', user.id)
        .in('role', ['owner', 'admin'])

      const transformedOrgs = userOrgs?.map((userOrg: any) => ({
        ...userOrg.organizations,
        role: userOrg.role
      })) || []

      setOrganizations(transformedOrgs)
      
      // Select first organization by default
      if (transformedOrgs.length > 0) {
        setSelectedOrg(transformedOrgs[0])
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading organizations...</span>
        </div>
      </div>
    )
  }

  if (organizations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Admin Access</h3>
        <p className="text-muted-foreground">
          You need admin or owner access to an organization to manage ticket categories.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Category Management</h1>
        <p className="text-muted-foreground">
          Organize tickets by creating and managing categories for {selectedOrg?.name}
        </p>
      </div>

      {/* Organization Selector */}
      {organizations.length > 1 && (
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Organization:</span>
            <select
              value={selectedOrg?.id || ''}
              onChange={(e) => {
                const org = organizations.find(o => o.id === e.target.value)
                if (org) setSelectedOrg(org)
              }}
              className="px-3 py-2 border rounded-md"
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </Card>
      )}
      
      {selectedOrg && (
        <CategoryManagement 
          organizationId={selectedOrg.id}
          onCategoriesUpdate={() => {
            // Refresh if needed
          }}
        />
      )}
    </div>
  )
}
