"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Send,
  Shield,
  MessageSquare,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react"

interface TicketResponseFormProps {
  ticketId: string
  onResponseAdded: () => void
  userRole: string
}

export function TicketResponseForm({ ticketId, onResponseAdded, userRole }: TicketResponseFormProps) {
  const [responseText, setResponseText] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const canAddInternalNotes = ['owner', 'admin', 'agent'].includes(userRole)
  const canRespond = ['owner', 'admin', 'agent', 'member'].includes(userRole)

  if (!canRespond) {
    return (
      <Card className="p-6 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h4 className="font-medium mb-2">Permission Required</h4>
        <p className="text-sm text-muted-foreground">
          You need to be a member of this organization to respond to tickets.
        </p>
      </Card>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!responseText.trim()) {
      toast.error('Please enter a response')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to respond')
        return
      }

      // Add response
      const { data: response, error: responseError } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          response_text: responseText.trim(),
          is_internal: isInternal,
          user_id: user.id,
          user_email: user.email,
          response_type: isInternal ? 'internal_note' : 'public_response'
        })
        .select()
        .single()

      if (responseError) throw responseError

      // Update ticket first_response_at if this is the first response
      const { data: ticket } = await supabase
        .from('tickets')
        .select('first_response_at')
        .eq('id', ticketId)
        .single()

      if (ticket && !ticket.first_response_at && !isInternal) {
        await supabase
          .from('tickets')
          .update({ 
            first_response_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', ticketId)
      }

      // Create activity log
      await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: ticketId,
          activity_type: isInternal ? 'note_added' : 'commented',
          description: isInternal 
            ? `Added internal note`
            : `Added public response`,
          user_id: user.id,
          user_email: user.email,
          metadata: {
            response_id: response.id,
            is_internal: isInternal
          }
        })

      toast.success(isInternal ? 'Internal note added' : 'Response sent successfully')
      
      // Reset form
      setResponseText("")
      setIsInternal(false)
      
      // Notify parent component
      onResponseAdded()

    } catch (error) {
      console.error('Error adding response:', error)
      toast.error('Failed to add response. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Response</h3>
          
          {canAddInternalNotes && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsInternal(!isInternal)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                  isInternal 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {isInternal ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Internal Note</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Public Response</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="response">
            {isInternal ? 'Internal Note' : 'Response'} *
          </Label>
          <Textarea
            id="response"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder={isInternal 
              ? "Add an internal note visible only to team members..."
              : "Type your response to the customer..."
            }
            rows={6}
            required
          />
          <p className="text-xs text-muted-foreground">
            {isInternal 
              ? "This note will only be visible to team members with agent access or higher."
              : "This response will be visible to the customer and all team members."
            }
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isInternal && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Internal Note
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setResponseText("")
                setIsInternal(false)
              }}
              disabled={submitting}
            >
              Clear
            </Button>
            
            <Button type="submit" disabled={submitting || !responseText.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isInternal ? 'Adding Note...' : 'Sending...'}
                </>
              ) : (
                <>
                  {isInternal ? (
                    <Shield className="h-4 w-4 mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {isInternal ? 'Add Note' : 'Send Response'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
