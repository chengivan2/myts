import type { Metadata } from "next";
import { OnboardingProvider } from "@/contexts/onboarding-context";

export const metadata: Metadata = {
  title: "Organization Setup - TicketFlow",
  description: "Set up your organization and start managing customer support tickets with TicketFlow's multi-tenant platform.",
  robots: "noindex, nofollow", // Prevent indexing of onboarding pages
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen mesh-bg">
        {/* Background */}
        <div className="absolute inset-0 mesh-bg-blue" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </OnboardingProvider>
  );
}
