"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { UserCircle } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Dashboard Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold lg:hidden">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    MyTS
                  </span>
                </h1>
                <span className="text-muted-foreground hidden lg:block">Dashboard</span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* User menu would go here */}
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <UserCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
