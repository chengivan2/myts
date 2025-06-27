"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Building2, 
  Globe, 
  Image as ImageIcon, 
  Save, 
  Loader2, 
  Upload,
  X,
  Plus,
  Trash2,
  ExternalLink,
  AlertTriangle
} from "lucide-react"

interface Organization {
  id: string
  name: string
  subdomain: string
  profile: any
  logo_url: string | null
  created_at: string
}

interface OrganizationDomain {
  id: string
  domain: string
}

export default function OrganizationProfile() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const organizationId = searchParams.get('org') // Optional org param
  
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [domains, setDomains] = useState<OrganizationDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    customMessage: "",
    primaryColor: "#0066cc",
    secondaryColor: "#4a90e2"
  })
  
  const [newDomain, setNewDomain] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchOrganization()
  }, [organizationId])

  const fetchOrganization = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      let targetOrgId = organizationId

      // If no org ID provided, get the user's primary organization
      if (!targetOrgId) {
        const { data: memberships } = await supabase
          .from('organization_members')
          .select('organization_id, role')
          .eq('user_id', user.id)
          .eq('role', 'owner')
          .limit(1)
          .single()

        if (!memberships) {
          toast.error('No organization found. You need to be an owner of an organization.')
          router.push('/dashboard')
          return
        }

        targetOrgId = memberships.organization_id
      }

      // Get organization membership to verify permissions
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', targetOrgId)
        .eq('user_id', user.id)
        .single()

      if (!membership || membership.role !== 'owner') {
        toast.error('You do not have permission to manage this organization')
        router.push('/dashboard')
        return
      }

      // Get organization details
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', targetOrgId)
        .single()

      if (orgError) throw orgError

      setOrganization(org)
      setFormData({
        name: org.name,
        description: org.profile?.description || "",
        customMessage: org.profile?.customMessage || "",
        primaryColor: org.profile?.branding?.primaryColor || "#0066cc",
        secondaryColor: org.profile?.branding?.secondaryColor || "#4a90e2"
      })
      setLogoPreview(org.logo_url)

      // Get organization domains
      const { data: domainsData, error: domainsError } = await supabase
        .from('organization_domains')
        .select('*')
        .eq('organization_id', targetOrgId)

      if (domainsError) throw domainsError
      setDomains(domainsData || [])

    } catch (error) {
      console.error('Error fetching organization:', error)
      toast.error('Failed to load organization details')
    } finally {
      setLoading(false)
    }
  }

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      console.log('Starting logo upload for org:', organization?.id, 'file:', file.name, 'size:', file.size)
      
      // Validate file
      if (!file || file.size === 0) {
        toast.error('Invalid file provided')
        return null
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file must be smaller than 5MB')
        return null
      }

      // Check file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast.error('Logo must be a PNG, JPEG, GIF, or WebP image')
        return null
      }

      const fileExt = file.name.split('.').pop() || 'png'
      const fileName = `${organization?.id}.${fileExt}`
      
      // Check if bucket exists
      const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets()
      if (bucketListError) {
        console.error('Error listing buckets:', bucketListError)
        toast.error('Storage configuration error')
        return null
      }

      const bucketExists = buckets?.some(b => b.name === 'organization-logos')
      if (!bucketExists) {
        console.error('organization-logos bucket does not exist!')
        toast.error('Storage bucket not configured. Please contact support.')
        return null
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        toast.error(`Upload failed: ${uploadError.message}`)
        throw uploadError
      }

      console.log('Upload successful:', uploadData)

      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName)

      console.log('Generated public URL:', publicUrl)
      return publicUrl

    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Failed to upload logo. Please try again.')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!organization) return

    try {
      setSaving(true)

      let logoUrl = organization?.logo_url

      // Upload new logo if selected
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile)
        if (!logoUrl) {
          // Upload failed, don't continue
          return
        }
      }

      // Update organization
      const updatedProfile = {
        description: formData.description,
        customMessage: formData.customMessage,
        branding: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor
        }
      }

      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          profile: updatedProfile,
          logo_url: logoUrl
        })
        .eq('id', organization.id)

      if (updateError) throw updateError

      toast.success('Organization updated successfully!')
      
      // Refresh data
      await fetchOrganization()
      setLogoFile(null)

    } catch (error) {
      console.error('Error updating organization:', error)
      toast.error('Failed to update organization')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const addDomain = async () => {
    if (!newDomain.trim() || !organization) return

    try {
      const { error } = await supabase
        .from('organization_domains')
        .insert({
          organization_id: organization.id,
          domain: newDomain.trim().toLowerCase()
        })

      if (error) throw error

      toast.success('Domain added successfully!')
      setNewDomain("")
      fetchOrganization()
    } catch (error) {
      console.error('Error adding domain:', error)
      toast.error('Failed to add domain')
    }
  }

  const removeDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('organization_domains')
        .delete()
        .eq('id', domainId)

      if (error) throw error

      toast.success('Domain removed successfully!')
      fetchOrganization()
    } catch (error) {
      console.error('Error removing domain:', error)
      toast.error('Failed to remove domain')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Organization not found</h2>
        <p className="text-muted-foreground">The organization you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Profile</h1>
          <p className="text-muted-foreground">
            Manage your organization's settings and branding
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Globe className="h-3 w-3" />
            <span>{organization.subdomain}.myticketingsysem.site</span>
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://${organization.subdomain}.myticketingsysem.site`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Visit Site</span>
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter organization name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your organization"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="customMessage">Custom Welcome Message</Label>
                <Textarea
                  id="customMessage"
                  value={formData.customMessage}
                  onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                  placeholder="Custom message for your support portal"
                  rows={2}
                />
              </div>
            </div>
          </Card>

          {/* Branding */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Branding</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-12 h-10 p-1 border"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    placeholder="#0066cc"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-12 h-10 p-1 border"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    placeholder="#4a90e2"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Email Domains */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Allowed Email Domains</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Only users with email addresses from these domains can create accounts
            </p>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  onKeyPress={(e) => e.key === 'Enter' && addDomain()}
                />
                <Button onClick={addDomain} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {domains.map((domain) => (
                  <Badge key={domain.id} variant="outline" className="flex items-center space-x-1">
                    <span>@{domain.domain}</span>
                    <button
                      onClick={() => removeDomain(domain.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              {domains.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No domain restrictions - anyone can create an account
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Logo Upload */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Organization Logo
            </h2>
            
            <div className="space-y-4">
              {/* Current Logo */}
              {logoPreview && (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Organization logo"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={removeLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* Upload */}
              <div>
                <Label htmlFor="logo" className="cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={saving || uploading}
            className="w-full"
            size="lg"
          >
            {(saving || uploading) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
