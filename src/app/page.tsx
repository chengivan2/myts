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
    <footer className="mesh-bg-blue glass-card p-10">
      <div className="flex justify-between items-center">
        <p className="text-xs text-foreground/50">© TicketFlow 2025</p>
        <ThemeToggle />
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
