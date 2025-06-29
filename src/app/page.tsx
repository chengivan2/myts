"use client"

import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { FAQ } from "@/components/sections/faq"
import { Testimonials } from "@/components/sections/testimonials"
import { About } from "@/components/sections/about"
import { CTA } from "@/components/sections/cta"
import { Contact } from "@/components/sections/contact"

// Placeholder component for sections
const SectionPlaceholder = ({ title }: { title: string }) => (
  
<motion.div className="flex justify-center items-center h-96">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-10 text-center"
    >
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <p className="text-foreground/70">
        This is a placeholder for the <strong>{title}</strong> section.
      </p>
    </motion.div>
  </motion.div>
)

function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background with ticket illustration */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: 'url(/images/myts-ticket-illustration.png)'
        }}
      />
      
      {/* Semi-transparent overlay for better readability */}
      <div className="absolute inset-0 bg-background/40" />
      
      {/* Content */}
      <div className="relative mesh-bg-blue/30 p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left: Logo and description */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/myts-logo.png"
                alt="MyTS Logo"
                className="h-10 w-10"
              />
              <h3 className="text-xl font-bold">MyTS</h3>
            </div>
            <p className="text-sm text-foreground/70 max-w-sm">
              Streamline your customer support with our powerful ticketing system. 
              Manage tickets, track performance, and delight your customers.
            </p>
          </div>
          
          {/* Center: Links (optional - can add later) */}
          <div className="hidden md:block">
            {/* Space for future footer links */}
          </div>
          
          {/* Right: Copyright and theme toggle */}
          <div className="flex flex-col md:items-end space-y-2">
            <ThemeToggle />
            <p className="text-xs text-foreground/50">© MyTS 2025. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="overflow-hidden">
      <Navigation />
      <Hero />
      
      <main className="flex flex-col items-center">
        {/* Sections */}
        <Features />
        <Testimonials />
        <FAQ />
        <About />
        <Contact />
      </main>
      
      {/* CTA Section - positioned above footer */}
      <CTA />
      <Footer />
    </div>
  )
}
