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
import { Plus, X, Mail, Shield, AlertCircle } from "lucide-react"

const steps = [
  { id: 1, title: "Details", description: "Basic information" },
  { id: 2, title: "Subdomain", description: "Choose your subdomain" },
  { id: 3, title: "Domains", description: "Email domain setup" },
  { id: 4, title: "Profile", description: "Branding and preferences" },
  { id: 5, title: "Review", description: "Confirm and create" },
]

export default function OnboardingStep3() {
  const [loading, setLoading] = useState(false)
  const [newDomain, setNewDomain] = useState("")
  const router = useRouter()
  const { data, updateData } = useOnboarding()
  const [domains, setDomains] = useState<string[]>(data.allowedDomains)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  // Initialize domains from context
  useEffect(() => {
    setDomains(data.allowedDomains)
  }, [data.allowedDomains])

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
    return domainRegex.test(domain)
  }

  const addDomain = () => {
    if (!newDomain.trim()) {
      toast.error("Please enter a domain")
      return
    }

    const cleanDomain = newDomain.trim().toLowerCase()
    
    if (!validateDomain(cleanDomain)) {
      toast.error("Please enter a valid domain (e.g., company.com)")
      return
    }

    if (domains.includes(cleanDomain)) {
      toast.error("This domain is already added")
      return
    }

    setDomains([...domains, cleanDomain])
    setNewDomain("")
    toast.success("Domain added successfully")
  }

  const removeDomain = (domainToRemove: string) => {
    setDomains(domains.filter(domain => domain !== domainToRemove))
    toast.success("Domain removed")
  }

  const onSubmit = async (formData: any) => {
    setLoading(true)

    // Update onboarding context with domains (allow empty array)
    updateData({
      allowedDomains: domains,
      currentStep: 4
    })

    setTimeout(() => {
      setLoading(false)
      toast.success("Email domains configured!")
      router.push("/onboarding/step4")
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addDomain()
    }
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
        <ProgressIndicator currentStep={3} steps={steps} />

        {/* Form */}
        <div className="glass-card p-8 rounded-3xl">
          <div className="text-center mb-8">
            <Badge variant="outline" className="glass-pill mb-4">
              Step 3: Email Domain Setup
            </Badge>
            <h1 className="text-3xl font-bold mb-4">
              Configure{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                allowed domains
              </span>
            </h1>
            <p className="text-muted-foreground">
              Only users with email addresses from these domains can be added as team members
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Current User Email Info */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Security Note</p>
                  <p className="text-xs text-muted-foreground">
                    This ensures only your organization's employees can access your ticketing system
                  </p>
                </div>
              </div>
            </div>

            {/* Add Domain Section */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Add Allowed Email Domains
              </label>
              
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="company.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={addDomain}
                  className="px-6"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Enter domains without @ symbol (e.g., "company.com" not "@company.com")
              </p>
            </div>

            {/* Domains List */}
            {domains.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-3">
                  Allowed Domains ({domains.length})
                </label>
                <div className="space-y-2">
                  {domains.map((domain, index) => (
                    <motion.div
                      key={domain}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-3 glass rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">@{domain}</p>
                          <p className="text-xs text-muted-foreground">
                            Users with this domain can be added as team members
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDomain(domain)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Domain Guidelines */}
            <div className="glass rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                Domain Guidelines:
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Only users with emails from these domains can be added as team members</li>
                <li>• You can add multiple domains if your organization uses several</li>
                <li>• Domain verification may be required for some features</li>
                <li>• You can modify these domains later from your organization settings</li>
              </ul>
            </div>

            {/* Example Section */}
            <div className="glass rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-2">Examples:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">For company.com:</span>
                  <span className="font-medium">john@company.com ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">For startup.io:</span>
                  <span className="font-medium">sarah@startup.io ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Not allowed:</span>
                  <span className="text-red-500">user@gmail.com ✗</span>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/onboarding/step2")}
                className="flex-1 glass-pill"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
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
