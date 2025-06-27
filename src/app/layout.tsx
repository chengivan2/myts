import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TicketFlow - Modern Multi-Tenant Ticketing System",
  description: "Streamline customer support with our enterprise-grade, multi-tenant ticketing system. Built for modern organizations with advanced analytics, role-based access, and seamless integrations.",
  keywords: ["ticketing system", "customer support", "multi-tenant", "enterprise", "help desk"],
  authors: [{ name: "TicketFlow Team" }],
  openGraph: {
    title: "TicketFlow - Modern Solutions for Customer Engagement",
    description: "Highly customizable components for building modern customer support experiences.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
