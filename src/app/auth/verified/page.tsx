"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Building2, User } from "lucide-react";

export default function Verified() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Error getting user:", error);
          router.push("/auth/signup");
          return;
        }

        if (!user) {
          router.push("/auth/signup");
          return;
        }

        if (!user.email_confirmed_at) {
          router.push("/auth/welcome");
          return;
        }

        setUser(user);
      } catch (error) {
        console.error("Verification check error:", error);
        router.push("/auth/signup");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleContinue = () => {
    // You can redirect to onboarding or dashboard
    router.push("/onboarding");
  };

  const handleSkipForNow = () => {
    // Redirect to a basic dashboard or home
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 mesh-bg-blue" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-lg"
      >
        <div className="glass-card p-8 rounded-3xl text-center">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 10
            }}
            className="mb-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <Badge variant="outline" className="glass-pill mb-4">
              Email Verified!
            </Badge>
            <h1 className="text-4xl font-bold mb-3">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TicketFlow
              </span>
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Your email has been successfully verified. You're all set to start using our ticketing system!
            </p>
          </motion.div>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-8"
          >
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">{user.user_metadata?.full_name || "User"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-4"
          >
            <Button 
              onClick={handleContinue} 
              className="w-full py-3 text-lg rounded-xl"
            >
              <Building2 className="mr-2 h-5 w-5" />
              Create Your Organization
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              onClick={handleSkipForNow}
              variant="outline" 
              className="w-full glass-pill"
            >
              Skip for now
            </Button>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 pt-6 border-t border-border/50"
          >
            <p className="text-xs text-muted-foreground">
              You can create an organization later from your dashboard.
              Organizations allow you to manage teams and customize your ticketing portal.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
