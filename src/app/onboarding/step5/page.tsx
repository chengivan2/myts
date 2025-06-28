"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressIndicator } from "@/components/onboarding/progress-indicator"
import { useOnboarding } from "@/contexts/onboarding-context"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { createClient } from "@/utils/supabase/client"
import { 
  Building2, 
  Globe, 
  Mail, 
  Image as ImageIcon, 
  CheckCircle, 
  Loader2,
  ArrowRight,
  Edit
} from "lucide-react"

const steps = [
  { id: 1, title: "Details", description: "Basic information" },
  { id: 2, title: "Subdomain", description: "Choose your subdomain" },
  { id: 3, title: "Domains", description: "Email domain setup" },
  { id: 4, title: "Profile", description: "Branding and preferences" },
  { id: 5, title: "Review", description: "Confirm and create" },
]

export default function OnboardingStep5() {
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { data: onboardingData, resetData } = useOnboarding()


  const createOrganization = async () => {
    if (!onboardingData.organizationName || !onboardingData.subdomain) {
      toast.error('Please complete all required fields')
      return
    }

    setCreating(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if subdomain is still available using RPC function
      const { data: availabilityCheck, error: checkError } = await supabase
        .rpc('check_subdomain_availability', { 
          subdomain_input: onboardingData.subdomain 
        })

      if (checkError || !availabilityCheck?.available) {
        toast.error('Subdomain is no longer available. Please choose another.')
        setCreating(false)
        return
      }

      // Create organization profile object
      const organizationProfile = {
        description: onboardingData.organizationDescription,
        customMessage: onboardingData.customMessage,
        branding: {
          primaryColor: '#0066cc',
          secondaryColor: '#4a90e2'
        }
      }

      let orgData: any
      let orgId: string

      try {
        // Try using the atomic helper function first (recommended approach)
        const { data: atomicResult, error: atomicError } = await supabase
          .rpc('create_organization_with_owner', {
            org_name: onboardingData.organizationName,
            org_subdomain: onboardingData.subdomain,
            org_profile: organizationProfile,
            org_logo_url: null,
            owner_user_id: user.id
          })
        
        if (atomicError) throw atomicError
        
        // Check if the function call was successful
        if (!atomicResult?.success) {
          throw new Error(atomicResult?.message || 'Failed to create organization')
        }
        
        orgId = atomicResult.organization_id
        orgData = { id: orgId }
      } catch (atomicFunctionError) {
        console.log('Atomic function failed, falling back to manual approach:', atomicFunctionError)
        
        // Fallback to manual approach
        const { data: manualOrgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: onboardingData.organizationName,
            subdomain: onboardingData.subdomain,
            profile: organizationProfile,
            logo_url: null // Will be updated after logo upload
          })
          .select()
          .single()

        if (orgError) throw orgError
        
        orgData = manualOrgData
        orgId = orgData.id

        // Create organization membership for the creator
        const { error: membershipError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: orgData.id,
            user_id: user.id,
            role: 'owner'
          })

        if (membershipError) throw membershipError
      }

      // Note: Logo can be uploaded later from the organization profile page

      // Insert allowed domains
      if (onboardingData.allowedDomains.length > 0) {
        const domainInserts = onboardingData.allowedDomains.map(domain => ({
          organization_id: orgId,
          domain: domain
        }))

        const { error: domainsError } = await supabase
          .from('organization_domains')
          .insert(domainInserts)

        if (domainsError) throw domainsError
      }

      toast.success('Organization created successfully!')
      
      // Clear onboarding data
      resetData()
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error) {
      console.error('Error creating organization:', error)
      toast.error('Failed to create organization. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  // Validation - make sure we have required data
  if (!onboardingData.organizationName || !onboardingData.subdomain) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-3xl max-w-md text-center"
        >
          <h2 className="text-xl font-semibold mb-4">Incomplete Setup</h2>
          <p className="text-muted-foreground mb-6">
            Please complete the previous steps before reviewing your organization.
          </p>
          <Button onClick={() => router.push('/onboarding/step1')}>
            Go to Step 1
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl"
      >
        <ProgressIndicator currentStep={5} steps={steps} />

        <div className="glass-card p-8 rounded-3xl">
          <div className="text-center mb-8">
            <Badge variant="outline" className="glass-pill mb-4">
              Step 5: Review & Confirm
            </Badge>
            <h1 className="text-3xl font-bold mb-4">
              Ready to{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                create your organization
              </span>
            </h1>
            <p className="text-muted-foreground">
              Please review your information before creating your organization
            </p>
          </div>

          <div className="space-y-6">
            {/* Organization Details */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-primary" />
                  Organization Details
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/onboarding/step1")}
                  className="text-primary hover:text-primary"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Organization Name</p>
                  <p className="font-medium">{onboardingData.organizationName}</p>
                </div>
                {onboardingData.organizationDescription && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{onboardingData.organizationDescription}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Subdomain */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-primary" />
                  Subdomain
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/onboarding/step2")}
                  className="text-primary hover:text-primary"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="font-mono">
                  {onboardingData.subdomain}.myticketingsysem.site
                </Badge>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Available</span>
              </div>
            </div>

            {/* Allowed Domains */}
            {onboardingData.allowedDomains.length > 0 && (
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-primary" />
                    Allowed Email Domains
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/onboarding/step3")}
                    className="text-primary hover:text-primary"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {onboardingData.allowedDomains.map((domain) => (
                    <Badge key={domain} variant="outline">
                      @{domain}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Logo Note */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2 text-primary" />
                  Organization Logo
                </h3>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex-shrink-0">
                  <ImageIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Logo Upload Available After Creation
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You can upload your organization logo from the organization profile page after creation.
                  </p>
                </div>
              </div>
            </div>

            {/* Create Organization Button */}
            <div className="pt-4">
              <Button
                onClick={createOrganization}
                disabled={creating}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating Organization...
                  </>
                ) : (
                  <>
                    Create Organization
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Back Button */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/onboarding/step4")}
                disabled={creating}
              >
                Back to Previous Step
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}