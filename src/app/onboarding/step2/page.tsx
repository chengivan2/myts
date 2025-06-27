"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressIndicator } from "@/components/onboarding/progress-indicator"
import { useOnboarding } from "@/contexts/onboarding-context"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { CheckCircle, XCircle, RefreshCw, Globe } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

const steps = [
  { id: 1, title: "Details", description: "Basic information" },
  { id: 2, title: "Subdomain", description: "Choose your subdomain" },
  { id: 3, title: "Domains", description: "Email domain setup" },
  { id: 4, title: "Profile", description: "Branding and preferences" },
  { id: 5, title: "Review", description: "Confirm and create" },
]

interface SubdomainStatus {
  available: boolean | null
  checking: boolean
  message: string
}

export default function OnboardingStep2() {
  const [loading, setLoading] = useState(false)
  const [subdomainStatus, setSubdomainStatus] = useState<SubdomainStatus>({
    available: null,
    checking: false,
    message: ""
  })
  const router = useRouter()
  const { data, updateData } = useOnboarding()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      subdomain: data.subdomain
    }
  })

  // Update form value when data changes
  useEffect(() => {
    setValue('subdomain', data.subdomain)
  }, [data.subdomain, setValue])

  const subdomain = watch("subdomain")

  // Debounced subdomain availability check
  useEffect(() => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainStatus({
        available: null,
        checking: false,
        message: ""
      })
      return
    }

    const timeoutId = setTimeout(async () => {
      await checkSubdomainAvailability(subdomain)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [subdomain])

  const checkSubdomainAvailability = async (subdomain: string) => {
    setSubdomainStatus({
      available: null,
      checking: true,
      message: "Checking availability..."
    })

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('organizations')
        .select('subdomain')
        .eq('subdomain', subdomain.toLowerCase())
        .maybeSingle()

      if (error) {
        setSubdomainStatus({
          available: null,
          checking: false,
          message: "Error checking availability"
        })
        return
      }

      if (data) {
        setSubdomainStatus({
          available: false,
          checking: false,
          message: "This subdomain is already taken"
        })
      } else {
        setSubdomainStatus({
          available: true,
          checking: false,
          message: "This subdomain is available!"
        })
      }
    } catch (error) {
      setSubdomainStatus({
        available: null,
        checking: false,
        message: "Error checking availability"
      })
    }
  }

  const onSubmit = async (formData: any) => {
    if (!subdomainStatus.available) {
      toast.error("Please choose an available subdomain")
      return
    }

    setLoading(true)

    // Update onboarding context
    updateData({
      subdomain: formatSubdomain(formData.subdomain),
      currentStep: 3
    })

    setTimeout(() => {
      setLoading(false)
      toast.success("Subdomain configured!")
      router.push("/onboarding/step3")
    }, 500)
  }

  const formatSubdomain = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={2} steps={steps} />

        {/* Form */}
        <div className="glass-card p-8 rounded-3xl">
          <div className="text-center mb-8">
            <Badge variant="outline" className="glass-pill mb-4">
              Step 2: Choose Your Subdomain
            </Badge>
            <h1 className="text-3xl font-bold mb-4">
              Your organization's{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                unique URL
              </span>
            </h1>
            <p className="text-muted-foreground">
              This will be your organization's portal where customers can submit tickets
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium mb-2">
                Subdomain
              </label>
              
              {/* URL Preview */}
              <div className="glass rounded-xl p-4 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Your portal will be:</span>
                </div>
                <div className="mt-2 font-mono text-lg">
                  <span className="text-primary font-semibold">
                    {subdomain ? formatSubdomain(subdomain) : "your-company"}
                  </span>
                  <span className="text-muted-foreground">.myticketingsysem.site</span>
                </div>
              </div>

              {/* Input */}
              <div className="relative">
                <input
                  id="subdomain"
                  type="text"
                  placeholder="your-company"
                  className="w-full p-3 glass rounded-xl pr-12"
                  {...register("subdomain", {
                    required: "Subdomain is required",
                    minLength: {
                      value: 3,
                      message: "Subdomain must be at least 3 characters"
                    },
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message: "Only lowercase letters, numbers, and hyphens allowed"
                    },
                    setValueAs: formatSubdomain
                  })}
                />
                
                {/* Status Indicator */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {subdomainStatus.checking && (
                    <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />
                  )}
                  {subdomainStatus.available === true && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {subdomainStatus.available === false && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>

              {/* Status Message */}
              {subdomainStatus.message && (
                <p className={`text-sm mt-2 ${
                  subdomainStatus.available === true 
                    ? "text-green-600" 
                    : subdomainStatus.available === false 
                    ? "text-red-600" 
                    : "text-muted-foreground"
                }`}>
                  {subdomainStatus.message}
                </p>
              )}

              {errors.subdomain && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.subdomain.message as string}
                </p>
              )}
            </div>

            {/* Guidelines */}
            <div className="glass rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-2">Subdomain Guidelines:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 3-50 characters long</li>
                <li>• Only lowercase letters, numbers, and hyphens</li>
                <li>• Cannot start or end with a hyphen</li>
                <li>• Must be unique across all organizations</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/onboarding/step1")}
                className="flex-1 glass-pill"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !subdomainStatus.available} 
                className="flex-1"
              >
                {loading ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
