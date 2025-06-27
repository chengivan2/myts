"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { AlertCircle, Home, Search } from "lucide-react"
import Link from "next/link"

export default function OrganizationNotFound() {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 mesh-bg-blue" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-lg text-center"
      >
        <div className="glass-card p-8 rounded-3xl">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto">
              <Search className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          {/* Header */}
          <div className="mb-8">
            <Badge variant="outline" className="glass-pill mb-4">
              Organization Not Found
            </Badge>
            <h1 className="text-3xl font-bold mb-3">
              We couldn't find that{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                organization
              </span>
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              The organization subdomain you're looking for doesn't exist or may have been moved.
            </p>
          </div>

          {/* Suggestions */}
          <div className="glass rounded-xl p-4 mb-8 text-left">
            <h3 className="font-semibold text-sm mb-3">Double-check:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• The subdomain spelling is correct</li>
              <li>• The organization is still active</li>
              <li>• You have the right domain</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link href="https://myticketingsysem.site">
              <Button className="w-full py-3 rounded-xl">
                <Home className="mr-2 h-5 w-5" />
                Go to Main Site
              </Button>
            </Link>
            
            <Link href="https://myticketingsysem.site/contact">
              <Button variant="outline" className="w-full glass-pill">
                Contact Support
              </Button>
            </Link>
          </div>

          {/* Help */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              If you believe this is an error, please contact the organization directly 
              or reach out to our support team.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
