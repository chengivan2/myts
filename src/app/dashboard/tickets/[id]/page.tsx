"use client"

import { useParams } from "next/navigation"

export default function TicketPage() {
  const params = useParams()
  
  return (
    <div className="p-8">
      <h1>Ticket Page</h1>
      <p>Ticket ID: {params.id}</p>
      <p>This is working if you can see this!</p>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  )
}
