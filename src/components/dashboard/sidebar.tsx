"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"
import { 
  Home,
  Building2, 
  Ticket, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  Menu,
  X,
  LogOut,
  Crown,
  UserCircle
} from "lucide-react"

interface Organization {
  id: string
  name: string
  subdomain: string
  role: string
}

const navigationItems = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: Home,
    description: "Overview and stats"
  },
  { 
    href: "/dashboard/tickets", 
    label: "Tickets", 
    icon: Ticket,
    description: "Support requests"
  },
  { 
    href: "/dashboard/team", 
    label: "Team", 
    icon: Users,
    description: "Manage agents"
  },
  { 
    href: "/dashboard/analytics", 
    label: "Analytics", 
    icon: BarChart3,
    description: "Performance reports"
  },
  { 
    href: "/dashboard/settings", 
    label: "Settings", 
    icon: Settings,
    description: "Account preferences"
  }
]

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Get organizations
      const { data: userOrgs } = await supabase
        .from('organization_members')
        .select(`
          role,
          organizations (
            id,
            name,
            subdomain
          )
        `)
        .eq('user_id', user?.id || '')

      const transformedOrgs = userOrgs?.map((userOrg: any) => ({
        ...userOrg.organizations,
        role: userOrg.role
      })) || []

      setOrganizations(transformedOrgs)
      
      // Set first org as selected by default
      if (transformedOrgs.length > 0) {
        setSelectedOrg(transformedOrgs[0])
      }
    }

    fetchData()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth/signin'
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              TicketFlow
            </span>
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Organization Selector */}
      {organizations.length > 0 && (
        <div className="p-4 border-b border-border/50 w-full overflow-hidden">
          <div className="space-y-2 w-full max-w-full">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Organization</p>
            <div className="space-y-1 w-full max-w-full">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => setSelectedOrg(org)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors group overflow-hidden",
                    selectedOrg?.id === org.id 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1 mr-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate" title={org.name}>{org.name}</p>
                        <p className="text-xs text-muted-foreground truncate" title={`${org.subdomain}.myticketingsysem.site`}>
                          {org.subdomain}.myticketingsysem.site
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {org.role === 'owner' && (
                        <Crown className="h-3 w-3 text-yellow-500" />
                      )}
                      <Badge variant={org.role === 'owner' ? 'default' : 'secondary'} className="text-xs">
                        {org.role}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Organization Actions */}
            <div className="flex space-x-2 pt-2 w-full">
              <Link href="/onboarding" className="flex-1 min-w-0">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Plus className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">New Org</span>
                </Button>
              </Link>
              {selectedOrg && selectedOrg.role === 'owner' && (
                <Link href={`/dashboard/profile?org=${selectedOrg.id}`} className="flex-1 min-w-0">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Settings className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Manage</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "group-hover:text-foreground"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium",
                      isActive ? "text-primary" : "group-hover:text-foreground"
                    )}>
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <UserCircle className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.user_metadata?.full_name || user?.email || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full mt-2 justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-card/50 backdrop-blur-md border-r border-border/50 z-40 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-card/95 backdrop-blur-md border-r border-border/50 z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
