"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Ticket, 
  Search, 
  Filter, 
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react"

interface TicketData {
  id: string
  reference_id: string
  subject: string
  status: string
  priority: string
  created_at: string
  customer_email: string
  assigned_to?: string
}

interface Organization {
  id: string
  name: string
  role: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

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
        await fetchTickets(transformedOrgs[0].id)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTickets = async (orgId: string) => {
    try {
      const supabase = createClient()
      
      // Fetch tickets for the selected organization
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          reference_id,
          subject,
          status,
          priority,
          created_at,
          customer_email,
          assigned_to
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-blue-100 text-blue-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

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
            <Ticket className="h-8 w-8 mr-3 text-primary" />
            Tickets
          </h1>
          <p className="text-muted-foreground">
            Manage support tickets for {selectedOrg?.name || 'your organization'}
          </p>
        </div>
      </div>

      {/* Organization Selector */}
      {organizations.length > 1 && (
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Organization:</span>
          <select title="Select Organization" 
            value={selectedOrg?.id || ''}
            onChange={(e) => {
              const org = organizations.find(o => o.id === e.target.value)
              if (org) {
                setSelectedOrg(org)
                fetchTickets(org.id)
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

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select title="Filter by Status" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border rounded-md"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card className="p-8 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
            <p className="text-muted-foreground">
              {tickets.length === 0 
                ? "No tickets have been created yet." 
                : "No tickets match your current filters."}
            </p>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(ticket.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{ticket.subject}</h3>
                      <Badge variant="outline" className="text-xs">
                        #{ticket.reference_id}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      From: {ticket.customer_email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Role-based access note */}
      {selectedOrg && selectedOrg.role === 'agent' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Agent Access:</strong> You can view and respond to tickets assigned to you or unassigned tickets.
          </p>
        </div>
      )}
    </div>
  )
}
