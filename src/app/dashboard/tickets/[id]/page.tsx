"use client"

import { useParams } from "next/navigation"

export default function TicketDetailPage() {
  const params = useParams()
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">It Works! 🎉</h1>
      <div className="mt-4 space-y-2">
        <p>Ticket ID: <strong>{params.id}</strong></p>
        <p>Dynamic routing is working correctly!</p>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{JSON.stringify(params, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
