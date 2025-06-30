"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { 
  Edit3,
  Check,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  Play
} from "lucide-react"

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

interface TicketHeaderProps {
  ticket: TicketDetail
  onTicketUpdated: () => void
  userRole: string
}

const statusOptions = [
  { value: 'new', label: 'New', icon: AlertCircle, color: 'bg-blue-500' },
  { value: 'open', label: 'Open', icon: AlertCircle, color: 'bg-red-500' },
  { value: 'pending', label: 'Pending', icon: Pause, color: 'bg-yellow-500' },
  { value: 'in_progress', label: 'In Progress', icon: Play, color: 'bg-orange-500' },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle2, color: 'bg-green-500' },
  { value: 'closed', label: 'Closed', icon: XCircle, color: 'bg-gray-500' },
  { value: 'on_hold', label: 'On Hold', icon: Clock, color: 'bg-purple-500' },
]

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'normal', label: 'Normal', color: 'bg-green-500' },
  { value: 'high', label: 'High', color: 'bg-yellow-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
]

export function TicketHeader({ ticket, onTicketUpdated, userRole }: TicketHeaderProps) {
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [isEditingPriority, setIsEditingPriority] = useState(false)
  const [updating, setUpdating] = useState(false)

  const canEdit = ['owner', 'admin', 'agent'].includes(userRole)

  const updateTicket = async (updates: Partial<TicketDetail>) => {
    if (!canEdit) {
      toast.error('You do not have permission to update this ticket')
      return
    }

    setUpdating(true)
    try {
      const supabase = createClient()
      
      // Update ticket
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id)

      if (ticketError) throw ticketError

      // Create activity log
      const { data: { user } } = await supabase.auth.getUser()
      
      if (updates.status && updates.status !== ticket.status) {
        await supabase
          .from('ticket_activities')
          .insert({
            ticket_id: ticket.id,
            activity_type: 'status_changed',
            description: `Status changed from ${ticket.status} to ${updates.status}`,
            old_value: ticket.status,
            new_value: updates.status,
            user_id: user?.id,
            user_email: user?.email
          })
      }

      if (updates.priority && updates.priority !== ticket.priority) {
        await supabase
          .from('ticket_activities')
          .insert({
            ticket_id: ticket.id,
            activity_type: 'priority_changed',
            description: `Priority changed from ${ticket.priority} to ${updates.priority}`,
            old_value: ticket.priority,
            new_value: updates.priority,
            user_id: user?.id,
            user_email: user?.email
          })
      }

      toast.success('Ticket updated successfully')
      onTicketUpdated()
    } catch (error) {
      console.error('Error updating ticket:', error)
      toast.error('Failed to update ticket')
    } finally {
      setUpdating(false)
      setIsEditingStatus(false)
      setIsEditingPriority(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    if (statusOption) {
      const Icon = statusOption.icon
      return <Icon className="h-4 w-4" />
    }
    return <AlertCircle className="h-4 w-4" />
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption?.color || 'bg-gray-500'
  }

  const getPriorityColor = (priority: string) => {
    const priorityOption = priorityOptions.find(opt => opt.value === priority)
    return priorityOption?.color || 'bg-gray-500'
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Subject and Reference */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 mr-4">
            <h1 className="text-2xl font-bold mb-2 break-words">{ticket.subject}</h1>
            <Badge variant="outline" className="text-sm">
              #{ticket.reference_id}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <div className="border-l-4 border-muted pl-4">
          <p className="text-muted-foreground whitespace-pre-wrap break-words">
            {ticket.description}
          </p>
        </div>

        {/* Status and Priority Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            {isEditingStatus && canEdit ? (
              <div className="flex items-center space-x-2">
                <select
                  value={ticket.status}
                  onChange={(e) => updateTicket({ status: e.target.value })}
                  className="px-3 py-1 border rounded-md text-sm"
                  disabled={updating}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingStatus(false)}
                  disabled={updating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={ticket.status === 'resolved' ? 'default' : 'secondary'}
                  className="flex items-center space-x-1"
                >
                  {getStatusIcon(ticket.status)}
                  <span>{statusOptions.find(opt => opt.value === ticket.status)?.label || ticket.status}</span>
                </Badge>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingStatus(true)}
                    disabled={updating}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">Priority:</span>
            {isEditingPriority && canEdit ? (
              <div className="flex items-center space-x-2">
                <select
                  value={ticket.priority}
                  onChange={(e) => updateTicket({ priority: e.target.value })}
                  className="px-3 py-1 border rounded-md text-sm"
                  disabled={updating}
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingPriority(false)}
                  disabled={updating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="outline"
                  className={`flex items-center space-x-1 ${
                    ticket.priority === 'urgent' || ticket.priority === 'critical' 
                      ? 'border-red-200 text-red-700' 
                      : ticket.priority === 'high'
                      ? 'border-orange-200 text-orange-700'
                      : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`} />
                  <span>{priorityOptions.find(opt => opt.value === ticket.priority)?.label || ticket.priority}</span>
                </Badge>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingPriority(true)}
                    disabled={updating}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Category */}
          {ticket.ticket_categories && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">Category:</span>
              <div className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: ticket.ticket_categories.color || '#6B7280' }}
                />
                <span className="text-sm">{ticket.ticket_categories.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>Customer: <strong>{ticket.user_email}</strong></span>
          <span>•</span>
          <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
          {ticket.updated_at !== ticket.created_at && (
            <>
              <span>•</span>
              <span>Updated: {new Date(ticket.updated_at).toLocaleString()}</span>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
