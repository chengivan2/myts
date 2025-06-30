"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Ticket {
  id: string
  subject: string
  reference_id: string
  status: string
  priority: string
  user_email: string
  created_at: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('tickets')
        .select('id, subject, reference_id, status, priority, user_email, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading tickets...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Tickets</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {tickets.map((ticket) => (
          <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{ticket.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    #{ticket.reference_id} • From: {ticket.user_email}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{ticket.status}</Badge>
                  <Badge variant="outline">{ticket.priority}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      
      {tickets.length === 0 && (
        <p className="text-center text-muted-foreground">No tickets found</p>
      )}
    </div>
  )
}
