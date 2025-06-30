"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UserCircle, Shield, Inbox, FileText } from "lucide-react"

interface TicketResponse {
  id: string
  response_text: string
  is_internal: boolean
  created_at: string
  updated_at: string
  user_email: string | null
  user_id: string | null
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

interface TicketTimelineProps {
  ticket: {
    id: string
    subject: string
    reference_id: string
    status: string
  }
  responses: TicketResponse[]
  activities: TicketActivity[]
  userRole: string
  currentUser: any
}

type TimelineItem = 
  | (TicketResponse & { type: 'response' })
  | (TicketActivity & { type: 'activity' })

export function TicketTimeline({ ticket, responses, activities, userRole, currentUser }: TicketTimelineProps) {
  // Combine and sort all timeline items
  const timelineItems: TimelineItem[] = [
    ...responses.map(response => ({ ...response, type: 'response' as const })),
    ...activities.map(activity => ({ ...activity, type: 'activity' as const }))
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'created':
        return <Inbox className="h-4 w-4" />
      case 'status_changed':
        return <Shield className="h-4 w-4" />
      case 'priority_changed':
        return <Shield className="h-4 w-4" />
      case 'assigned':
      case 'unassigned':
        return <UserCircle className="h-4 w-4" />
      case 'commented':
        return <FileText className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const canSeeInternalNotes = ['owner', 'admin', 'agent'].includes(userRole)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Timeline</h3>
      
      {timelineItems.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">No responses yet</h4>
          <p className="text-sm text-muted-foreground">
            Be the first to respond to this ticket
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {timelineItems.map((item) => {
            // Skip internal notes if user can't see them
            if (item.type === 'response' && item.is_internal && !canSeeInternalNotes) {
              return null
            }

            return (
              <div key={`${item.type}-${item.id}`} className="flex space-x-4 items-start">
                {/* Avatar or Icon */}
                <div className="flex-shrink-0">
                  {item.type === 'response' ? (
                    item.user?.avatar_url ? (
                      <img
                        src={item.user.avatar_url}
                        alt={item.user.full_name || item.user.email}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-sm font-medium text-white">
                        {item.user?.full_name?.charAt(0).toUpperCase() || item.user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                      {getActivityIcon(item.activity_type)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <Card className={`flex-1 p-4 ${
                  item.type === 'response' && item.is_internal 
                    ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' 
                    : ''
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {item.type === 'response' 
                          ? item.user?.full_name || item.user?.email || 'Unknown User'
                          : item.user?.full_name || item.user_email || 'System'
                        }
                      </span>
                      
                      {item.type === 'response' && item.is_internal && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Internal Note
                        </Badge>
                      )}
                      
                      {item.type === 'activity' && (
                        <Badge variant="outline" className="text-xs">
                          {item.activity_type.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {item.type === 'response' ? item.response_text : item.description}
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
