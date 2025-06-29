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
  EyeOff
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
  organizationId: string
  onCategoriesUpdate?: () => void
}

export function CategoryManagement({ organizationId, onCategoriesUpdate }: CategoryManagementProps) {
  const [categories, setCategories] = useState<TicketCategory[]>([])
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
    fetchCategories()
  }, [organizationId])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('organization_id', organizationId)
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
          organization_id: organizationId,
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
      fetchCategories()
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
      fetchCategories()
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
      fetchCategories()
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
                <div className="flex items-center space-x-2">
                  {colorOptions.map((color) => (
                    <button
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
    </div>
  )
}
