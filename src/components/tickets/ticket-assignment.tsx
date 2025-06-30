"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  User,
  UserPlus,
  UserMinus,
  ChevronDown,
  Loader2,
  Search
} from "lucide-react"

interface TicketDetail {
  id: string
  assigned_to: string | null
  organization_id: string
  assigned_user?: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
}

interface TeamMember {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  role: string
}

interface TicketAssignmentProps {
  ticket: TicketDetail
  onTicketUpdated: () => void
  userRole: string
}

export function TicketAssignment({ ticket, onTicketUpdated, userRole }: TicketAssignmentProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const canAssign = ['owner', 'admin'].includes(userRole)

  useEffect(() => {
    fetchTeamMembers()
  }, [ticket.organization_id])

  const fetchTeamMembers = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          users (
            id,
            full_name,
            email,
            avatar_url
          ),
          role
        `)
        .eq('organization_id', ticket.organization_id)
        .in('role', ['owner', 'admin', 'agent'])

      if (error) throw error

      const members = data?.map((member: any) => ({
        ...member.users,
        role: member.role
      })) || []

      setTeamMembers(members)
    } catch (error) {
      console.error('Error fetching team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (userId: string | null) => {
    if (!canAssign) {
      toast.error('You do not have permission to assign tickets')
      return
    }

    setAssigning(true)

    try {
      const supabase = createClient()
      
      // Update ticket assignment
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({
          assigned_to: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id)

      if (ticketError) throw ticketError

      // Create activity log
      const { data: { user } } = await supabase.auth.getUser()
      
      const assignedMember = userId ? teamMembers.find(m => m.id === userId) : null
      const activityDescription = userId 
        ? `Assigned to ${assignedMember?.full_name || assignedMember?.email}`
        : 'Unassigned ticket'

      await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: ticket.id,
          activity_type: userId ? 'assigned' : 'unassigned',
          description: activityDescription,
          old_value: ticket.assigned_to,
          new_value: userId,
          user_id: user?.id,
          user_email: user?.email
        })

      toast.success(userId ? 'Ticket assigned successfully' : 'Ticket unassigned successfully')
      setShowDropdown(false)
      onTicketUpdated()

    } catch (error) {
      console.error('Error updating assignment:', error)
      toast.error('Failed to update assignment')
    } finally {
      setAssigning(false)
    }
  }

  const filteredMembers = teamMembers.filter(member =>
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading team members...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Assignment</h3>
          {canAssign && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={assigning}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Current Assignment */}
        <div className="space-y-2">
          {ticket.assigned_user ? (
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              {ticket.assigned_user.avatar_url ? (
                <img
                  src={ticket.assigned_user.avatar_url}
                  alt={ticket.assigned_user.full_name || ticket.assigned_user.email}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-sm font-medium text-white">
                  {ticket.assigned_user.full_name?.charAt(0).toUpperCase() || 
                   ticket.assigned_user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {ticket.assigned_user.full_name || ticket.assigned_user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {ticket.assigned_user.email}
                </p>
              </div>
              {canAssign && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAssign(null)}
                  disabled={assigning}
                  title="Unassign"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-6 border-2 border-dashed border-muted rounded-lg">
              <div className="text-center">
                <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Unassigned</p>
                {canAssign && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Click + to assign to a team member
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Assignment Dropdown */}
        {showDropdown && canAssign && (
          <Card className="border-2 border-primary/20">
            <div className="p-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md"
                />
              </div>

              {/* Team Members List */}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No team members found
                  </p>
                ) : (
                  filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleAssign(member.id)}
                      disabled={assigning || member.id === ticket.assigned_to}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                        member.id === ticket.assigned_to ? 'bg-primary/10' : ''
                      }`}
                    >
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.full_name || member.email}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-xs font-medium text-white">
                          {member.full_name?.charAt(0).toUpperCase() || 
                           member.email.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium truncate">
                            {member.full_name || member.email}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDropdown(false)
                    setSearchTerm("")
                  }}
                  disabled={assigning}
                >
                  Cancel
                </Button>
                
                {ticket.assigned_to && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAssign(null)}
                    disabled={assigning}
                  >
                    {assigning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserMinus className="h-4 w-4" />
                    )}
                    Unassign
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Permission Notice */}
        {!canAssign && (
          <p className="text-xs text-muted-foreground">
            Only admins and owners can assign tickets
          </p>
        )}
      </div>
    </Card>
  )
}
