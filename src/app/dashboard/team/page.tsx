"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Plus,
  Crown,
  Shield,
  User,
  Mail,
  MoreVertical,
  Trash2
} from "lucide-react"
import { toast } from "sonner"

interface TeamMember {
  id: string
  role: string
  joined_at: string
  users: {
    id: string
    email: string
    user_metadata: {
      full_name?: string
    }
  }
}

interface Organization {
  id: string
  name: string
  role: string
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      
      // Get user's organizations
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userOrgs } = await supabase
        .from('organization_members')
        .select(`
          role,
          organizations (
            id,
            name
          )
        `)
        .eq('user_id', user.id)

      const transformedOrgs = userOrgs?.map((userOrg: any) => ({
        ...userOrg.organizations,
        role: userOrg.role
      })) || []

      setOrganizations(transformedOrgs)
      
      if (transformedOrgs.length > 0) {
        setSelectedOrg(transformedOrgs[0])
        await fetchTeamMembers(transformedOrgs[0].id)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async (orgId: string) => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          role,
          joined_at,
          users!inner (
            id,
            email,
            user_metadata
          )
        `)
        .eq('organization_id', orgId)
        .order('joined_at', { ascending: false })

      if (error) throw error
      setTeamMembers(data || [])
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !selectedOrg) return

    setInviting(true)
    try {
      // TODO: Implement invite functionality
      // This would typically send an email invitation
      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail("")
    } catch (error) {
      console.error('Error inviting member:', error)
      toast.error('Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />
      case 'agent':
        return <User className="h-4 w-4 text-green-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      case 'agent':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canManageTeam = selectedOrg?.role === 'owner' || selectedOrg?.role === 'admin'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="h-8 w-8 mr-3 text-primary" />
            Team
          </h1>
          <p className="text-muted-foreground">
            Manage team members for {selectedOrg?.name || 'your organization'}
          </p>
        </div>
        {canManageTeam && (
          <Button onClick={() => document.getElementById('invite-section')?.scrollIntoView()}>
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Organization Selector */}
      {organizations.length > 1 && (
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Organization:</span>
          <select 
            value={selectedOrg?.id || ''}
            onChange={(e) => {
              const org = organizations.find(o => o.id === e.target.value)
              if (org) {
                setSelectedOrg(org)
                fetchTeamMembers(org.id)
              }
            }}
            className="px-3 py-1 border rounded-md"
          >
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Team Members List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Team Members ({teamMembers.length})</h2>
        
        {teamMembers.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team members</h3>
            <p className="text-muted-foreground">
              {canManageTeam ? "Start by inviting your first team member." : "No team members found."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {teamMembers.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {member.users.user_metadata?.full_name || 'User'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {member.users.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.role)}
                      <Badge className={`text-xs ${getRoleBadgeColor(member.role)}`}>
                        {member.role}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </span>
                    {canManageTeam && member.role !== 'owner' && (
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Invite Section */}
      {canManageTeam && (
        <Card className="p-6" id="invite-section">
          <h3 className="text-lg font-semibold mb-4">Invite New Member</h3>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleInviteMember} 
              disabled={inviting || !inviteEmail.trim()}
            >
              {inviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            New members will be added as agents by default. You can change their role after they join.
          </p>
        </Card>
      )}

      {/* Role-based access note */}
      {!canManageTeam && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Limited Access:</strong> Only owners and admins can manage team members.
          </p>
        </div>
      )}
    </div>
  )
}
