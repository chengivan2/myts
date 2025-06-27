import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - TicketFlow",
  description: "Manage your organizations, tickets, and team members with TicketFlow's comprehensive dashboard.",
  robots: "noindex, nofollow", // Prevent indexing of private dashboard
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  TicketFlow
                </span>
              </h1>
              <span className="text-muted-foreground">Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User menu would go here */}
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
