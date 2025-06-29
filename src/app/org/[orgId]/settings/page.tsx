"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategoryManagement } from "@/components/dashboard/category-management"
import { 
  Settings, 
  Building2, 
  Tag,
  Shield,
  Crown,
  Palette,
  Bell,
  Users,
  ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { getOrganizationFromSubdomain, getSubdomain } from "@/lib/subdomain"

interface Organization {
  id: string
  name: string
  subdomain: string
  profile: any
  logo_url: string | null
  created_at: string
}

interface UserMembership {
  role: string
  user_id: string
  organization_id: string
}

export default function OrganizationSettingsPage({ params }: { params: { orgId: string } }) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchOrganizationData()
  }, [params.orgId])

  const fetchOrganizationData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/signin')
        return
      }
      
      setUser(user)

      // Get organization by subdomain
      let orgSubdomain = params.orgId
      
      // If we're on a subdomain, get the org from the subdomain
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname
        const detectedSubdomain = getSubdomain(hostname)
        const detectedOrgSubdomain = getOrganizationFromSubdomain(detectedSubdomain)
        if (detectedOrgSubdomain) {
          orgSubdomain = detectedOrgSubdomain
        }
      }

      // Get organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('subdomain', orgSubdomain)
        .single()

      if (orgError || !orgData) {
        console.error('Organization error:', orgError)
        toast.error('Organization not found')
        router.push('/dashboard')
        return
      }

      setOrganization(orgData)

      // Get user's membership in this organization
      const { data: membershipData, error: membershipError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', orgData.id)
        .single()

      if (membershipError || !membershipData) {
        console.error('Membership error:', membershipError)
        toast.error('You do not have access to this organization')
        router.push('/dashboard')
        return
      }

      setUserMembership(membershipData)

      // Check if user has admin/owner access
      if (!['owner', 'admin'].includes(membershipData.role)) {
        toast.error('You need admin access to view organization settings')
        router.push(`/org/${orgSubdomain}`)
        return
      }

    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load organization settings')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryUpdate = () => {
    // This callback will be called when categories are updated
    toast.success('Categories updated successfully')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!organization || !userMembership) {
    return null
  }

  const orgUrl = `${organization.subdomain}.myticketingsysem.site`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <Link href={`/org/${organization.subdomain}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold flex items-center">
          <Settings className="h-8 w-8 mr-3 text-primary" />
          Organization Settings
        </h1>
        <p className="text-muted-foreground">
          Manage settings and configuration for {organization.name}
        </p>
      </div>

      {/* Organization Info */}
      <Card className="p-4 bg-muted/50 border border-border">
        <div className="flex items-center space-x-3">
          {organization.logo_url ? (
            <img
              src={organization.logo_url}
              alt={`${organization.name} logo`}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white text-lg font-bold">
              {organization.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-lg">{organization.name}</h2>
              {userMembership.role === 'owner' && (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
              <Badge variant={userMembership.role === 'owner' ? 'default' : 'secondary'}>
                {userMembership.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {orgUrl} • Created {new Date(organization.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Management */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Ticket Categories
            </h2>
            <p className="text-muted-foreground mb-4">
              Organize support tickets by department or issue type
            </p>
            <CategoryManagement 
              organizationId={organization.id}
              onCategoriesUpdate={handleCategoryUpdate}
            />
          </Card>

          {/* Organization Profile */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Organization Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Organization Name</label>
                <p className="text-muted-foreground">{organization.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Subdomain</label>
                <p className="text-muted-foreground">{organization.subdomain}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Public URL</label>
                <p className="text-muted-foreground">{orgUrl}</p>
              </div>
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Appearance & Branding
            </h2>
            <p className="text-muted-foreground">
              Customize your organization's appearance and branding settings...
            </p>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Organization Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="text-sm font-medium">Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Members</span>
                <span className="text-sm font-medium">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tickets</span>
                <span className="text-sm font-medium">0</span>
              </div>
            </div>
          </Card>

          {/* Team Management */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Management
            </h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Invite Members
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Manage Roles
              </Button>
              <Button variant="outline" className="w-full justify-start">
                View Activity
              </Button>
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Notifications
            </h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Notification Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Security Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
