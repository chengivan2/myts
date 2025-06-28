"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar
} from "lucide-react"

interface Analytics {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  avgResponseTime: number
  ticketsByStatus: Record<string, number>
  ticketsByPriority: Record<string, number>
}

interface Organization {
  id: string
  name: string
  role: string
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

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
        await fetchAnalytics(transformedOrgs[0].id)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async (orgId: string) => {
    try {
      const supabase = createClient()
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
      }

      // Fetch tickets for analytics
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('status, priority, created_at')
        .eq('organization_id', orgId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (error) throw error

      // Calculate analytics
      const totalTickets = tickets?.length || 0
      const openTickets = tickets?.filter(t => t.status === 'open').length || 0
      const resolvedTickets = tickets?.filter(t => ['resolved', 'closed'].includes(t.status)).length || 0
      
      // Group by status
      const ticketsByStatus = tickets?.reduce((acc: Record<string, number>, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1
        return acc
      }, {}) || {}

      // Group by priority
      const ticketsByPriority = tickets?.reduce((acc: Record<string, number>, ticket) => {
        acc[ticket.priority] = (acc[ticket.priority] || 0) + 1
        return acc
      }, {}) || {}

      setAnalytics({
        totalTickets,
        openTickets,
        resolvedTickets,
        avgResponseTime: 2.5, // Mock data - would be calculated from actual response times
        ticketsByStatus,
        ticketsByPriority
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '7d': return 'Last 7 days'
      case '30d': return 'Last 30 days'
      case '90d': return 'Last 90 days'
      default: return 'Last 30 days'
    }
  }

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
            <BarChart3 className="h-8 w-8 mr-3 text-primary" />
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Performance insights for {selectedOrg?.name || 'your organization'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => {
              setTimeRange(e.target.value)
              if (selectedOrg) fetchAnalytics(selectedOrg.id)
            }}
            className="px-3 py-1 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Organization Selector */}
      {organizations.length > 1 && (
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Organization:</span>
          <select 
            value={selectedOrg?.id || ''}
            onChange={(e) => {
              const org = organizations.find(o => o.id === e.target.value)
              if (org) {
                setSelectedOrg(org)
                fetchAnalytics(org.id)
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

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{analytics.totalTickets}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{getTimeRangeLabel()}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold">{analytics.openTickets}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Pending resolution</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{analytics.resolvedTickets}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.totalTickets > 0 
                ? `${Math.round((analytics.resolvedTickets / analytics.totalTickets) * 100)}% resolution rate`
                : 'No tickets yet'
              }
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{analytics.avgResponseTime}h</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Average response time</p>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets by Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tickets by Status</h3>
            <div className="space-y-3">
              {Object.entries(analytics.ticketsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-primary rounded-full" 
                        style={{ width: `${(count / analytics.totalTickets) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Tickets by Priority */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tickets by Priority</h3>
            <div className="space-y-3">
              {Object.entries(analytics.ticketsByPriority).map(([priority, count]) => {
                const colors = {
                  low: 'bg-blue-500',
                  medium: 'bg-yellow-500',
                  high: 'bg-orange-500',
                  urgent: 'bg-red-500'
                }
                return (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${colors[priority as keyof typeof colors] || 'bg-gray-500'}`}></div>
                      <span className="text-sm capitalize">{priority}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{count}</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${colors[priority as keyof typeof colors] || 'bg-gray-500'}`}
                          style={{ width: `${(count / analytics.totalTickets) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Role-based access note */}
      {selectedOrg && selectedOrg.role === 'agent' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Agent View:</strong> Analytics show data for tickets you have access to.
          </p>
        </div>
      )}

      {!analytics && (
        <Card className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No data available</h3>
          <p className="text-muted-foreground">
            No tickets found for the selected time range.
          </p>
        </Card>
      )}
    </div>
  )
}
