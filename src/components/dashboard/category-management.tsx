"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Loader2, 
  Tag,
  Eye,
  EyeOff,
  Building2,
  Crown
} from "lucide-react"

interface TicketCategory {
  id: string
  name: string
  description: string | null
  color: string | null
  is_active: boolean | null
  sort_order: number | null
  organization_id: string
  created_at: string | null
}

interface CategoryManagementProps {
  organizationId?: string
  onCategoriesUpdate?: () => void
}

interface Organization {
  id: string
  name: string
  subdomain: string
  role: string
  logo_url?: string | null
}

export function CategoryManagement({ organizationId, onCategoriesUpdate }: CategoryManagementProps) {
  const [categories, setCategories] = useState<TicketCategory[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(organizationId || null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#6B7280"
  })

  const colorOptions = [
    "#6B7280", "#EF4444", "#F97316", "#EAB308", 
    "#22C55E", "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899"
  ]

  useEffect(() => {
    if (organizationId) {
      setSelectedOrgId(organizationId)
      fetchCategories(organizationId)
    } else {
      fetchUserOrganizations()
    }
  }, [organizationId])

  useEffect(() => {
    if (selectedOrgId) {
      fetchCategories(selectedOrgId)
    }
  }, [selectedOrgId])

  const fetchUserOrganizations = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error('Please sign in to manage categories')
        return
      }

      // Get user's organizations where they have admin/owner access
      const { data: userOrgs, error: orgsError } = await supabase
        .from('organization_members')
        .select(`
          role,
          organizations (
            id,
            name,
            subdomain,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .in('role', ['owner', 'admin'])

      if (orgsError) {
        console.error('Organizations error:', orgsError)
        toast.error('Failed to load organizations')
        return
      }

      // Transform the data
      const transformedOrgs = userOrgs?.map((userOrg: any) => ({
        ...userOrg.organizations,
        role: userOrg.role
      })) || []

      setOrganizations(transformedOrgs)
      
      // Select first organization by default
      if (transformedOrgs.length > 0) {
        setSelectedOrgId(transformedOrgs[0].id)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load organizations')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async (orgId: string) => {
    if (!orgId) return
    
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('organization_id', orgId)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('ticket_categories')
        .insert({
          organization_id: selectedOrgId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          color: formData.color,
          is_active: true,
          sort_order: categories.length
        })
      
      if (error) throw error
      
      toast.success('Category created successfully')
      setFormData({ name: "", description: "", color: "#6B7280" })
      setIsCreating(false)
      if (selectedOrgId) fetchCategories(selectedOrgId)
      onCategoriesUpdate?.()
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    }
  }

  const handleUpdate = async (categoryId: string, updates: Partial<TicketCategory>) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('ticket_categories')
        .update(updates)
        .eq('id', categoryId)
      
      if (error) throw error
      
      toast.success('Category updated successfully')
      setEditingId(null)
      if (selectedOrgId) fetchCategories(selectedOrgId)
      onCategoriesUpdate?.()
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    }
  }

  const handleEditToggle = (category: TicketCategory) => {
    if (editingId === category.id) {
      setEditingId(null)
    } else {
      setFormData({
        name: category.name,
        description: category.description || "",
        color: category.color || "#6B7280"
      })
      setEditingId(category.id)
    }
  }

  const handleEditSubmit = (categoryId: string) => {
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }
    handleUpdate(categoryId, {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      color: formData.color
    })
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setFormData({ name: "", description: "", color: "#6B7280" })
  }

  const handleToggleActive = async (categoryId: string, isActive: boolean) => {
    await handleUpdate(categoryId, { is_active: !isActive })
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('ticket_categories')
        .delete()
        .eq('id', categoryId)
      
      if (error) throw error
      
      toast.success('Category deleted successfully')
      if (selectedOrgId) fetchCategories(selectedOrgId)
      onCategoriesUpdate?.()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading categories...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Ticket Categories
          </h3>
          <p className="text-sm text-muted-foreground">
            Organize tickets by department or issue type
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Organization Selector */}
      {!organizationId && organizations.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Select Organization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => setSelectedOrgId(org.id)}
                className={`p-4 rounded-lg border transition-all text-left h-full min-h-[80px] w-full ${
                  selectedOrgId === org.id
                    ? 'bg-primary/10 border-primary/20 ring-2 ring-primary/20'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start space-x-3 h-full">
                  {org.logo_url ? (
                    <img
                      src={org.logo_url}
                      alt={`${org.name} logo`}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1 mb-1">
                      <p className="font-medium text-sm truncate">{org.name}</p>
                      {org.role === 'owner' && (
                        <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="mb-2">
                      <Badge variant={org.role === 'owner' ? 'default' : 'secondary'} className="text-xs">
                        {org.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground break-all">
                      {org.subdomain}.myticketingsysem.site
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* No Admin Access Message */}
      {!organizationId && organizations.length === 0 && (
        <Card className="p-8 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">No Admin Access</h4>
          <p className="text-sm text-muted-foreground">
            You need admin or owner access to an organization to manage ticket categories.
          </p>
        </Card>
      )}

      {/* Show content only if we have a selected organization */}
      {selectedOrgId && (
        <>
          {/* Create New Category Form */}
      {isCreating && (
        <Card className="p-4 border-2 border-primary/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Create New Category</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setIsCreating(false)
                  setFormData({ name: "", description: "", color: "#6B7280" })
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Technical Support"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="space-y-3">
                  {/* Preset Colors */}
                  <div className="flex items-center space-x-2">
                    {colorOptions.map((color) => (
                      <button
                        title="Pick a color"
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          formData.color === color ? 'border-foreground scale-110' : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  
                  {/* Custom Color Input */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                      title="Choose custom color"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => {
                        const color = e.target.value
                        if (/^#[0-9A-F]{6}$/i.test(color) || color === '') {
                          setFormData({ ...formData, color })
                        }
                      }}
                      placeholder="#000000"
                      className="px-2 py-1 text-sm border rounded w-20"
                      maxLength={7}
                    />
                    <span className="text-xs text-muted-foreground">Custom hex color</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category"
                rows={2}
              />
            </div>
            
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                <Save className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <Card className="p-8 text-center">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">No categories yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first ticket category to help organize support requests
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Category
            </Button>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className={`p-4 ${editingId === category.id ? 'border-2 border-primary/20' : ''}`}>
              {editingId === category.id ? (
                // Inline Edit Form
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Edit Category</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleEditCancel}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Category name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex items-center space-x-2">
                        {colorOptions.map((color) => (
                          <button
                            title="Pick a color"
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color })}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              formData.color === color ? 'border-foreground scale-110' : 'border-border'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this category"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(category.id, category.is_active || false)}
                        title={category.is_active ? "Deactivate" : "Activate"}
                      >
                        {category.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        {category.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" onClick={handleEditCancel}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleEditSubmit(category.id)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Normal View
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color || '#6B7280' }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{category.name}</h4>
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(category.id, category.is_active || false)}
                      title={category.is_active ? "Deactivate" : "Activate"}
                    >
                      {category.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditToggle(category)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
        </>
      )}
    </div>
  )
}
