"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Building2, 
  Plus, 
  Users, 
  Ticket, 
  BarChart3, 
  Settings,
  ExternalLink,
  Crown,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity
} from "lucide-react"
import Link from "next/link"
import { getSubdomain, getOrganizationFromSubdomain } from "@/lib/subdomain"
import { OrganizationDashboard } from "@/components/dashboard/organization-dashboard"

interface Organization {
  id: string
  name: string
  subdomain: string
  profile: any
  created_at: string
}

interface UserOrganization extends Organization {
  role: string
}

interface PersonalTicket {
  id: string
  subject: string
  status: string
  priority: string
  created_at: string
  organization_id: string
  user_email: string
  reference_id: string
}

type DashboardView = 'personal' | 'organization'

export default function Dashboard() {
  const [organizations, setOrganizations] = useState<UserOrganization[]>([])
  const [personalTickets, setPersonalTickets] = useState<PersonalTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [subdomain, setSubdomain] = useState<string | null>(null)
  const [dashboardView, setDashboardView] = useState<DashboardView>('personal')

  useEffect(() => {
    // Detect subdomain on client side
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const detectedSubdomain = getSubdomain(hostname)
      const orgSubdomain = getOrganizationFromSubdomain(detectedSubdomain)
      setSubdomain(orgSubdomain)
    }

    const fetchUserAndOrganizations = async () => {
      const supabase = createClient()
      
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('User error:', userError)
          return
        }
        
        setUser(user)

        // Get user's organizations with role
        const { data: userOrgs, error: orgsError } = await supabase
          .from('organization_members')
          .select(`
            role,
            organizations (
              id,
              name,
              subdomain,
              profile,
              created_at
            )
          `)
          .eq('user_id', user.id)

        if (orgsError) {
          console.error('Organizations error:', orgsError)
          return
        }

        // Transform the data
        const transformedOrgs = userOrgs?.map((userOrg: any) => ({
          ...userOrg.organizations,
          role: userOrg.role
        })) || []

        setOrganizations(transformedOrgs)
        
        // Fetch personal tickets (tickets assigned to user)
        await fetchPersonalTickets(user.id)
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndOrganizations()
  }, [])

  const fetchPersonalTickets = async (userId: string) => {
    const supabase = createClient()
    
    try {
      // Get tickets assigned to the user
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('assigned_to', userId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      setPersonalTickets(tickets || [])
    } catch (error) {
      console.error('Error fetching personal tickets:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If we're on a subdomain, show the organization-specific dashboard
  if (subdomain) {
    return <OrganizationDashboard subdomain={subdomain} />
  }

  // Personal Dashboard Component
  const PersonalDashboard = () => {
    const personalStats = {
      assignedTickets: personalTickets.length,
      openTickets: personalTickets.filter(t => ['open', 'new'].includes(t.status)).length,
      pendingTickets: personalTickets.filter(t => t.status === 'pending').length,
      completedTickets: personalTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
    }

    return (
      <div className="space-y-6">
        {/* Personal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "My Tickets", value: personalStats.assignedTickets, icon: Ticket, color: "from-blue-500 to-cyan-500" },
            { label: "Open", value: personalStats.openTickets, icon: AlertTriangle, color: "from-orange-500 to-red-500" },
            { label: "Pending", value: personalStats.pendingTickets, icon: Clock, color: "from-yellow-500 to-orange-500" },
            { label: "Completed", value: personalStats.completedTickets, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
          ].map((stat) => (
            <Card key={stat.label} className="p-6">
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
        </div>

        {/* My Recent Tickets */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">My Recent Tickets</h3>
          {personalTickets.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tickets assigned to you yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {personalTickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium truncate">{ticket.subject}</h4>
                      <Badge variant={ticket.status === 'resolved' ? 'default' : 'secondary'}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>#{ticket.reference_id}</span>
                      <span>{ticket.user_email}</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Personal Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "View All My Tickets", icon: Ticket, href: "/dashboard/tickets" },
              { title: "My Performance", icon: Activity, href: "/dashboard/analytics" },
              { title: "Team", icon: Users, href: "/dashboard/team" },
              { title: "Settings", icon: Settings, href: "/dashboard/settings" },
            ].map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="p-4 hover:scale-105 transition-transform cursor-pointer">
                  <action.icon className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium">{action.title}</p>
                </Card>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  // Organization Overview Component (local dashboard content)
  const OrganizationOverview = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { label: "Organizations", value: organizations.length, icon: Building2, color: "from-blue-500 to-cyan-500" },
          { label: "Total Tickets", value: "0", icon: Ticket, color: "from-green-500 to-emerald-500" },
          { label: "Team Members", value: "0", icon: Users, color: "from-purple-500 to-pink-500" },
          { label: "Avg Response", value: "0h", icon: BarChart3, color: "from-orange-500 to-red-500" },
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

      {/* Organizations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Organizations</h2>
          <Link href="/onboarding">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Organization</span>
            </Button>
          </Link>
        </div>

        {organizations.length === 0 ? (
          /* Empty State */
          <Card className="p-12 text-center glass-card">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No organizations yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first organization to start managing customer support tickets
            </p>
            <Link href="/onboarding">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Organization
              </Button>
            </Link>
          </Card>
        ) : (
          /* Organizations Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org, index) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="p-6 glass-card group hover:scale-105 transition-transform cursor-pointer">
                  <div className="space-y-4">
                    {/* Organization Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1 mr-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-lg truncate" title={org.name}>{org.name}</h3>
                          <p className="text-sm text-muted-foreground truncate" title={`${org.subdomain}.myticketingsysem.site`}>
                            {org.subdomain}.myticketingsysem.site
                          </p>
                        </div>
                      </div>
                      
                      {/* Role Badge */}
                      <Badge variant={org.role === 'owner' ? 'default' : 'secondary'} className="flex-shrink-0">
                        {org.role === 'owner' && <Crown className="w-3 h-3 mr-1" />}
                        {org.role}
                      </Badge>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2">
                      {org.role === 'owner' ? (
                        <Link href={`/dashboard/profile?org=${org.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <Settings className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" variant="outline" className="flex-1" disabled>
                          <Settings className="w-4 h-4 mr-2" />
                          View Only
                        </Button>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <a 
                          href={`https://${org.subdomain}.myticketingsysem.site`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>

                    {/* Stats Preview */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/50">
                      <div className="text-center">
                        <p className="text-lg font-semibold">0</p>
                        <p className="text-xs text-muted-foreground">Tickets</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">0</p>
                        <p className="text-xs text-muted-foreground">Agents</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">0%</p>
                        <p className="text-xs text-muted-foreground">Resolved</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Create Organization", desc: "Set up a new support portal", icon: Building2, href: "/onboarding" },
            { title: "View All Tickets", desc: "Manage support requests", icon: Ticket, href: "#" },
            { title: "Team Management", desc: "Add and manage agents", icon: Users, href: "#" },
            { title: "Analytics", desc: "View performance reports", icon: BarChart3, href: "#" },
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

  // Otherwise, show the main dashboard with view selector
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.user_metadata?.full_name || 'User'}!
            </h1>
            <p className="text-muted-foreground text-lg">
              {dashboardView === 'personal' 
                ? 'Track your assigned tickets and personal performance' 
                : 'Manage your organizations and track your support operations'
              }
            </p>
          </div>
          
          {/* View Selector */}
          <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
            <Button
              variant={dashboardView === 'personal' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDashboardView('personal')}
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Personal</span>
            </Button>
            <Button
              variant={dashboardView === 'organization' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDashboardView('organization')}
              className="flex items-center space-x-2"
            >
              <Building2 className="h-4 w-4" />
              <span>Organizations</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Content */}
      <motion.div
        key={dashboardView}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {dashboardView === 'personal' ? <PersonalDashboard /> : <OrganizationOverview />}
      </motion.div>
    </div>
  )
}
