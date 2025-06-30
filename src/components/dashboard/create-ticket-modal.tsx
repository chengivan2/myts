"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { 
  X, 
  Ticket, 
  Building2, 
  Crown, 
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Search
} from "lucide-react"

interface Organization {
  id: string
  name: string
  subdomain: string
  role: string
  logo_url?: string | null
}

interface TicketCategory {
  id: string
  name: string
  description: string | null
  color: string | null
  is_active: boolean | null
}

interface CreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
  organizations: Organization[]
  currentOrganization?: Organization | null
  user: any
}

export function CreateTicketModal({ 
  isOpen, 
  onClose, 
  organizations, 
  currentOrganization,
  user 
}: CreateTicketModalProps) {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [categories, setCategories] = useState<TicketCategory[]>([])
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent" | "critical",
    categoryId: "",
    userEmail: user?.email || ""
  })
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [categorySearchTerm, setCategorySearchTerm] = useState("")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const priorityOptions = [
    { value: "low", label: "Low", color: "bg-blue-500" },
    { value: "normal", label: "Normal", color: "bg-green-500" },
    { value: "high", label: "High", color: "bg-yellow-500" },
    { value: "urgent", label: "Urgent", color: "bg-orange-500" },
    { value: "critical", label: "Critical", color: "bg-red-500" }
  ]

  // Initialize selectedOrg when modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentOrganization) {
        setSelectedOrg(currentOrganization)
      } else if (organizations.length > 0) {
        setSelectedOrg(organizations[0])
      }
    }
  }, [isOpen, currentOrganization, organizations])

  // Fetch categories when selected organization changes
  useEffect(() => {
    if (selectedOrg) {
      fetchCategories(selectedOrg.id)
    }
  }, [selectedOrg])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCategoryDropdown) {
        const target = event.target as Element
        if (!target.closest('.category-dropdown-container')) {
          setShowCategoryDropdown(false)
          setCategorySearchTerm("")
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCategoryDropdown])

  const fetchCategories = async (orgId: string) => {
    setLoadingCategories(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('organization_id', orgId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  const generateTicketReference = async (orgId: string) => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .rpc('generate_ticket_reference_id', { org_id: orgId })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error generating ticket reference:', error)
      // Fallback to simple timestamp-based ID
      return `TKT${Date.now()}`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedOrg) {
      toast.error('Please select an organization')
      return
    }

    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      // Generate reference ID
      const referenceId = await generateTicketReference(selectedOrg.id)
      
      // Create ticket
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          organization_id: selectedOrg.id,
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          user_email: formData.userEmail,
          reference_id: referenceId,
          status: 'new',
          source: 'portal',
          category_id: formData.categoryId || null,
          assigned_to: user?.id // Auto-assign to current user
        })
        .select()
        .single()

      if (error) throw error

      // Create initial activity
      await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: ticket.id,
          activity_type: 'created',
          description: `Ticket created by ${user?.user_metadata?.full_name || user?.email}`,
          user_id: user?.id,
          user_email: user?.email
        })

      toast.success(`Ticket created successfully! Reference: ${referenceId}`)
      
      // Reset form
      setFormData({
        subject: "",
        description: "",
        priority: "normal",
        categoryId: "",
        userEmail: user?.email || ""
      })
      
      onClose()
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast.error('Failed to create ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <Ticket className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Create New Ticket</h2>
                      <p className="text-sm text-muted-foreground">
                        Submit a new support request
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Organization Selection */}
                  {!currentOrganization && organizations.length > 1 && (
                    <div className="space-y-3">
                      <Label>Select Organization</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {organizations.map((org) => (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => setSelectedOrg(org)}
                            className={`p-3 rounded-lg border transition-all text-left ${
                              selectedOrg?.id === org.id
                                ? 'bg-primary/10 border-primary/20 ring-2 ring-primary/20'
                                : 'border-border hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {org.logo_url ? (
                                <img
                                  src={org.logo_url}
                                  alt={`${org.name} logo`}
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white text-sm font-medium">
                                  {org.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium">{org.name}</p>
                                  {org.role === 'owner' && (
                                    <Crown className="h-3 w-3 text-yellow-500" />
                                  )}
                                  <Badge variant={org.role === 'owner' ? 'default' : 'secondary'} className="text-xs">
                                    {org.role}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {org.subdomain}.myticketingsysem.site
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Organization Display */}
                  {currentOrganization && (
                    <div className="space-y-2">
                      <Label>Organization</Label>
                      <div className="p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{currentOrganization.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {currentOrganization.subdomain}.myticketingsysem.site
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief description of the issue"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed description of the issue"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Category Selection */}
                  {selectedOrg && (
                    <div className="space-y-2">
                      <Label>Category</Label>
                      {loadingCategories ? (
                        <div className="flex items-center space-x-2 text-muted-foreground p-3 border rounded-lg">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading categories...</span>
                        </div>
                      ) : (
                        <div className="relative category-dropdown-container">
                          {/* Dropdown trigger */}
                          <button
                            type="button"
                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                            className="w-full p-3 border rounded-lg text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              {formData.categoryId ? (
                                (() => {
                                  const selectedCategory = categories.find(c => c.id === formData.categoryId)
                                  return selectedCategory ? (
                                    <>
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: selectedCategory.color || '#6B7280' }}
                                      />
                                      <span className="text-sm font-medium">{selectedCategory.name}</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                                      <span className="text-sm font-medium">General</span>
                                    </>
                                  )
                                })()
                              ) : (
                                <>
                                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                                  <span className="text-sm font-medium text-muted-foreground">Select a category</span>
                                </>
                              )}
                            </div>
                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${
                              showCategoryDropdown ? 'rotate-180' : ''
                            }`} />
                          </button>
                          
                          {/* Dropdown content */}
                          {showCategoryDropdown && (
                            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-lg shadow-lg max-h-64 overflow-hidden">
                              {/* Search input */}
                              <div className="p-2 border-b">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search categories..."
                                    value={categorySearchTerm}
                                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                                    className="pl-9 text-sm"
                                  />
                                </div>
                              </div>
                              
                              {/* Category options */}
                              <div className="max-h-48 overflow-y-auto">
                                {/* General option */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, categoryId: "" })
                                    setShowCategoryDropdown(false)
                                    setCategorySearchTerm("")
                                  }}
                                  className={`w-full p-3 text-left hover:bg-muted/50 transition-colors border-b ${
                                    !formData.categoryId ? 'bg-primary/10 text-primary' : ''
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                                    <span className="text-sm font-medium">General</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">No specific category</p>
                                </button>
                                
                                {/* Filtered categories */}
                                {categories
                                  .filter(category => 
                                    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
                                    (category.description && category.description.toLowerCase().includes(categorySearchTerm.toLowerCase()))
                                  )
                                  .map((category) => (
                                    <button
                                      key={category.id}
                                      type="button"
                                      onClick={() => {
                                        setFormData({ ...formData, categoryId: category.id })
                                        setShowCategoryDropdown(false)
                                        setCategorySearchTerm("")
                                      }}
                                      className={`w-full p-3 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
                                        formData.categoryId === category.id ? 'bg-primary/10 text-primary' : ''
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <div 
                                          className="w-3 h-3 rounded-full" 
                                          style={{ backgroundColor: category.color || '#6B7280' }}
                                        />
                                        <span className="text-sm font-medium">{category.name}</span>
                                      </div>
                                      {category.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                                      )}
                                    </button>
                                  ))
                                }
                                
                                {/* No results message */}
                                {categorySearchTerm && categories.filter(category => 
                                  category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
                                  (category.description && category.description.toLowerCase().includes(categorySearchTerm.toLowerCase()))
                                ).length === 0 && (
                                  <div className="p-3 text-center text-muted-foreground">
                                    <p className="text-sm">No categories found</p>
                                    <p className="text-xs">Try a different search term</p>
                                  </div>
                                )}
                                
                                {/* No categories available */}
                                {categories.length === 0 && (
                                  <div className="p-3 text-center text-muted-foreground">
                                    <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                                    <p className="text-sm">No categories available</p>
                                    <p className="text-xs">Your organization hasn't set up any ticket categories yet.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Priority */}
                  <div className="space-y-3">
                    <Label>Priority</Label>
                    <div className="flex flex-wrap gap-2">
                      {priorityOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: option.value as any })}
                          className={`px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
                            formData.priority === option.value
                              ? 'bg-primary/10 border-primary/20 text-primary'
                              : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${option.color}`} />
                            <span>{option.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Email */}
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Customer Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={formData.userEmail}
                      onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                      placeholder="Customer email address"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to use your email address
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading || !selectedOrg}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Ticket className="h-4 w-4 mr-2" />
                          Create Ticket
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
