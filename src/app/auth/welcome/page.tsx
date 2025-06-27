"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Mail, RefreshCw, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Welcome() {
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    
    // In a real app, you'd need to store the email somewhere or ask for it again
    toast.info("Please sign up again if you need to resend the verification email.");
    
    setIsResending(false);
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 mesh-bg-blue" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card p-8 rounded-3xl text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          {/* Header */}
          <div className="mb-8">
            <Badge variant="outline" className="glass-pill mb-4">
              Almost There!
            </Badge>
            <h1 className="text-3xl font-bold mb-2">
              Check Your{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Email
              </span>
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              We've sent you a verification link. Click the link in your email to verify your account and complete the signup process.
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <div className="glass rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-sm">Check your inbox</p>
                  <p className="text-xs text-muted-foreground">
                    Look for an email from TicketFlow
                  </p>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-sm">Click the verification link</p>
                  <p className="text-xs text-muted-foreground">
                    This will confirm your email address
                  </p>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-sm">Start using TicketFlow</p>
                  <p className="text-xs text-muted-foreground">
                    Create your organization and invite your team
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or
            </div>
            
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full glass-pill"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
