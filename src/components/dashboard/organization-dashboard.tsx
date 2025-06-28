"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Ticket, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Settings,
  BarChart3
} from "lucide-react"
import Link from "next/link"

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

interface TicketData {
  id: string
  subject: string
  status: string
  created_at: string
  user_email: string
  ticket_id: string
}

interface MemberData {
  id: string
  role: string
  users: {
    id: string
    email: string
    full_name: string | null
  }
}

interface OrganizationDashboardProps {
  subdomain: string
}

export function OrganizationDashboard({ subdomain }: OrganizationDashboardProps) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null)
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [members, setMembers] = useState<MemberData[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrganizationData = async () => {
      const supabase = createClient()
      
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          setError('You must be logged in to view this organization')
          setLoading(false)
          return
        }
        
        setUser(user)

        // Get organization by subdomain
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('subdomain', subdomain)
          .single()

        if (orgError || !orgData) {
          setError('Organization not found')
          setLoading(false)
          return
        }

        setOrganization(orgData)

        // Check user's membership in this organization
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select('*')
          .eq('organization_id', orgData.id)
          .eq('user_id', user.id)
          .single()

        if (membershipError || !membershipData) {
          setError('You do not have access to this organization')
          setLoading(false)
          return
        }

        setUserMembership(membershipData)

        // Fetch tickets for this organization
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select('*')
          .eq('organization_id', orgData.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (!ticketsError && ticketsData) {
          setTickets(ticketsData)
        }

        // Fetch organization members (only if user is owner or admin)
        if (membershipData.role === 'owner' || membershipData.role === 'admin') {
          const { data: membersData, error: membersError } = await supabase
            .from('organization_members')
            .select(`
              id,
              role,
              users (
                id,
                email,
                full_name
              )
            `)
            .eq('organization_id', orgData.id)

          if (!membersError && membersData) {
            setMembers(membersData as any)
          }
        }

      } catch (error) {
        console.error('Error fetching organization data:', error)
        setError('Failed to load organization data')
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizationData()
  }, [subdomain])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !organization || !userMembership) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-8 text-center glass-card max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground mb-4">
            {error || "You don't have permission to access this organization"}
          </p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }

  const isOwnerOrAdmin = userMembership.role === 'owner' || userMembership.role === 'admin'

  return (
    <div className="space-y-8">
      {/* Organization Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          {organization.logo_url ? (
            <img
              src={organization.logo_url}
              alt={`${organization.name} logo`}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {organization.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold">{organization.name}</h1>
            <p className="text-muted-foreground">
              Your role: <Badge variant="outline">{userMembership.role}</Badge>
            </p>
            <p className="text-sm text-muted-foreground">
              {organization.subdomain}.myticketingsysem.site
            </p>
          </div>
        </div>
        
        {isOwnerOrAdmin && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        )}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { label: "Total Tickets", value: ticketStats.total, icon: Ticket, color: "from-blue-500 to-cyan-500" },
          { label: "Open Tickets", value: ticketStats.open, icon: AlertTriangle, color: "from-orange-500 to-red-500" },
          { label: "Pending", value: ticketStats.pending, icon: Clock, color: "from-yellow-500 to-orange-500" },
          { label: "Resolved", value: ticketStats.resolved, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
        ].map((stat, index) => (
          <Card key={stat.label} className="p-6 glass-card">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Recent Tickets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Tickets</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            {isOwnerOrAdmin && (
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            )}
          </div>
        </div>

        {tickets.length === 0 ? (
          <Card className="p-12 text-center glass-card">
            <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tickets yet</h3>
            <p className="text-muted-foreground mb-6">
              Start managing customer support by creating your first ticket
            </p>
            {isOwnerOrAdmin && (
              <Button>
                <Plus className="mr-2 h-5 w-5" />
                Create First Ticket
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="p-4 glass-card hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        <Badge 
                          variant={
                            ticket.status === 'resolved' ? 'default' :
                            ticket.status === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>#{ticket.ticket_id}</span>
                        <span>{ticket.user_email}</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Team Members (only for owners/admins) */}
      {isOwnerOrAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Team Members</h2>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member: any) => (
              <Card key={member.id} className="p-4 glass-card">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                    {member.users.full_name?.charAt(0) || member.users.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{member.users.full_name || 'No name'}</p>
                    <p className="text-sm text-muted-foreground">{member.users.email}</p>
                    <Badge variant="outline" className="mt-1">
                      {member.role}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "View All Tickets", desc: "Manage all support requests", icon: Ticket, href: "#" },
            { title: "Analytics", desc: "View performance reports", icon: BarChart3, href: "#" },
            ...(isOwnerOrAdmin ? [
              { title: "Team Management", desc: "Add and manage team members", icon: Users, href: "#" },
              { title: "Settings", desc: "Organization configuration", icon: Settings, href: "#" },
            ] : [])
          ].map((action) => (
            <Card key={action.title} className="p-4 glass-card group hover:scale-105 transition-transform cursor-pointer">
              <action.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{action.title}</h3>
              <p className="text-sm text-muted-foreground">{action.desc}</p>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
