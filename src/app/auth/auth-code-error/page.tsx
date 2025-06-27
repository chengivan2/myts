"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AuthCodeError() {
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
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          {/* Header */}
          <div className="mb-8">
            <Badge variant="outline" className="glass-pill mb-4">
              Verification Error
            </Badge>
            <h1 className="text-3xl font-bold mb-2">
              Something went{" "}
              <span className="bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                wrong
              </span>
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              We couldn't verify your email. This might happen if the verification link has expired or has already been used.
            </p>
          </div>

          {/* Solutions */}
          <div className="space-y-4 mb-8">
            <div className="glass rounded-xl p-4 text-left">
              <h3 className="font-semibold text-sm mb-2">What you can do:</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Check if you've already verified your email</li>
                <li>• Try signing up again with a fresh verification link</li>
                <li>• Make sure you're using the latest link from your email</li>
                <li>• Contact support if the issue persists</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link href="/auth/signup">
              <Button className="w-full py-3 rounded-xl">
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Signing Up Again
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full glass-pill">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Contact Support */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">
              Still having trouble?
            </p>
            <Link 
              href="mailto:support@ticketflow.com" 
              className="text-sm text-primary hover:underline"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
