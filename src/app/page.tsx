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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
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
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
          
          {/* Product Links */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Product</h4>
            <div className="flex flex-col space-y-2">
              <a href="#features" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="/auth/signin" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Sign In
              </a>
              <a href="/auth/signup" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Get Started
              </a>
            </div>
          </div>
          
          {/* Company Links */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Company</h4>
            <div className="flex flex-col space-y-2">
              <a href="#about" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                About
              </a>
              <a href="#contact" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Contact
              </a>
              <a href="/privacy" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
          
          {/* Newsletter Subscription */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Stay Updated</h4>
            <p className="text-sm text-foreground/70">
              Subscribe to our newsletter for product updates and support tips.
            </p>
            <form className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-3 py-2 text-sm bg-background/60 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-xs text-foreground/50">
                © 2025 MyTS. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <a href="/privacy" className="text-xs text-foreground/50 hover:text-foreground/70 transition-colors">
                  Privacy
                </a>
                <a href="/terms" className="text-xs text-foreground/50 hover:text-foreground/70 transition-colors">
                  Terms
                </a>
                <a href="/cookies" className="text-xs text-foreground/50 hover:text-foreground/70 transition-colors">
                  Cookies
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <p className="text-xs text-foreground/50">
                Made with ❤️ for better customer support
              </p>
            </div>
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
