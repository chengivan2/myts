"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string; // Where they should go after signing in
}

export function AuthGuard({ children, redirectTo = "/dashboard" }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Auth check error:", error);
          // Redirect to signin with the redirect parameter
          router.push(`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`);
          return;
        }

        if (!user) {
          // No user, redirect to signin
          router.push(`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`);
          return;
        }

        // User is authenticated
        setUser(user);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push(`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push(`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`);
      } else if (event === "SIGNED_IN" && session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render children (they'll be redirected)
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
