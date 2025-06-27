"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Ticket, Send, Search } from "lucide-react"
import { useParams } from "next/navigation"

interface Organization {
  id: string
  name: string
  subdomain: string
  profile: any
}

export default function OrganizationPortal() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()

  useEffect(() => {
    const fetchOrganization = async () => {
      const supabase = createClient()
      
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', params.orgId)
          .single()

        if (error) {
          console.error('Error fetching organization:', error)
          return
        }

        setOrganization(data)
      } catch (error) {
        console.error('Organization fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.orgId) {
      fetchOrganization()
    }
  }, [params.orgId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Organization Not Found</h1>
          <p className="text-muted-foreground">The organization you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mesh-bg">
      <div className="absolute inset-0 mesh-bg-blue" />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="glass-pill mb-4">
            {organization.subdomain}.myticketingsysem.site
          </Badge>
          <h1 className="text-5xl font-bold mb-4">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {organization.name}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Submit a support ticket or check the status of an existing ticket
          </p>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {/* Submit Ticket */}
          <div className="glass-card p-8 rounded-3xl text-center group cursor-pointer hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Send className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Submit a Ticket</h2>
            <p className="text-muted-foreground mb-6">
              Need help? Submit a support request and our team will get back to you shortly.
            </p>
            <Button className="w-full rounded-xl">
              Create New Ticket
            </Button>
          </div>

          {/* Check Ticket Status */}
          <div className="glass-card p-8 rounded-3xl text-center group cursor-pointer hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Check Ticket Status</h2>
            <p className="text-muted-foreground mb-6">
              Already have a ticket? Enter your ticket ID to check its current status.
            </p>
            <Button variant="outline" className="w-full rounded-xl glass-pill">
              Check Status
            </Button>
          </div>
        </motion.div>

        {/* Organization Branding */}
        {organization.profile?.custom_message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="glass-card p-6 rounded-2xl max-w-2xl mx-auto">
              <p className="text-muted-foreground italic">
                "{organization.profile.custom_message}"
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
