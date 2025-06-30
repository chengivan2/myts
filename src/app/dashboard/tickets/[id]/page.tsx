"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TicketHeader } from "@/components/tickets/ticket-header"
import { TicketTimeline } from "@/components/tickets/ticket-timeline"
import { TicketResponseForm } from "@/components/tickets/ticket-response-form"
import { TicketAssignment } from "@/components/tickets/ticket-assignment"
import { motion } from "framer-motion"
import { 
  ArrowLeft,
  Clock,
  User,
  Building2,
  Tag,
  Loader2
} from "lucide-react"
import Link from "next/link"

interface TicketDetail {
  id: string
  reference_id: string
  subject: string
  description: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  user_email: string
  assigned_to: string | null
  organization_id: string
  category_id: string | null
  source: string
  first_response_at: string | null
  resolved_at: string | null
  closed_at: string | null
  ticket_categories?: {
    id: string
    name: string
    color: string | null
  } | null
  assigned_user?: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
  organization?: {
    id: string
    name: string
    subdomain: string
  }
}

interface TicketResponse {
  id: string
  response_text: string
  is_internal: boolean
  created_at: string
  updated_at: string
  user_email: string | null
  user_id: string | null
  ticket_id: string
  response_type: string | null
  user?: {
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
}

interface TicketActivity {
  id: string
  activity_type: string
  description: string | null
  created_at: string
  user_email: string | null
  user_id: string | null
  old_value: any
  new_value: any
  metadata: any
  user?: {
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  
  console.log('TicketDetailPage rendered with params:', params)
  console.log('Ticket ID:', ticketId)
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [activities, setActivities] = useState<TicketActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    if (ticketId) {
      fetchTicketData()
    }
  }, [ticketId])

  const fetchTicketData = async () => {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/auth/signin')
        return
      }
      setUser(currentUser)

      // Fetch ticket details with relations
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_categories (
            id,
            name,
            color
          ),
          assigned_user:users!tickets_assigned_to_fkey (
            id,
            full_name,
            email,
            avatar_url
          ),
          organizations (
            id,
            name,
            subdomain
          )
        `)
        .eq('id', ticketId)
        .single()

      if (ticketError) throw ticketError
      setTicket(ticketData)

      // Check user role in organization
      const { data: memberData } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', currentUser.id)
        .eq('organization_id', ticketData.organization_id)
        .single()

      setUserRole(memberData?.role || 'member')

      // Fetch responses
      await fetchResponses()
      
      // Fetch activities
      await fetchActivities()

    } catch (error) {
      console.error('Error fetching ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchResponses = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ticket_responses')
        .select(`
          *,
          user:users (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setResponses(data || [])
    } catch (error) {
      console.error('Error fetching responses:', error)
    }
  }

  const fetchActivities = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ticket_activities')
        .select(`
          *,
          user:users (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    }
  }

  const handleResponseAdded = () => {
    fetchResponses()
    fetchActivities()
    // Refresh ticket data to update timestamps
    fetchTicketData()
  }

  const handleTicketUpdated = () => {
    fetchTicketData()
    fetchActivities()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading ticket details...</span>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Ticket not found</h2>
        <p className="text-muted-foreground mb-4">
          The ticket you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link href="/dashboard/tickets">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/tickets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header */}
          <TicketHeader 
            ticket={ticket} 
            onTicketUpdated={handleTicketUpdated}
            userRole={userRole}
          />

          {/* Ticket Timeline (Responses + Activities) */}
          <TicketTimeline
            ticket={ticket}
            responses={responses}
            activities={activities}
            userRole={userRole}
            currentUser={user}
          />

          {/* Response Form */}
          <TicketResponseForm
            ticketId={ticketId}
            onResponseAdded={handleResponseAdded}
            userRole={userRole}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Assignment */}
          <TicketAssignment
            ticket={ticket}
            onTicketUpdated={handleTicketUpdated}
            userRole={userRole}
          />

          {/* Ticket Details */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Ticket Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reference</span>
                <Badge variant="outline">#{ticket.reference_id}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={ticket.status === 'resolved' ? 'default' : 'secondary'}>
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <Badge variant="outline" className={
                  ticket.priority === 'urgent' || ticket.priority === 'critical' 
                    ? 'border-red-200 text-red-700' 
                    : ticket.priority === 'high'
                    ? 'border-orange-200 text-orange-700'
                    : ''
                }>
                  {ticket.priority}
                </Badge>
              </div>

              {ticket.ticket_categories && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: ticket.ticket_categories.color || '#6B7280' }}
                    />
                    <span className="text-sm">{ticket.ticket_categories.name}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Source</span>
                <span className="text-sm capitalize">{ticket.source}</span>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Customer: {ticket.user_email}</span>
                </div>
                
                {ticket.organization && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>Org: {ticket.organization.name}</span>
                  </div>
                )}
              </div>

              {ticket.first_response_at && (
                <>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    <strong>First Response:</strong><br />
                    {new Date(ticket.first_response_at).toLocaleString()}
                  </div>
                </>
              )}

              {ticket.resolved_at && (
                <div className="text-sm text-muted-foreground">
                  <strong>Resolved:</strong><br />
                  {new Date(ticket.resolved_at).toLocaleString()}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
