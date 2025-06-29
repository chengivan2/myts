"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"

const navItems = [
  { name: "Features", href: "#features" },
  { name: "Solutions", href: "#solutions" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    
    getUser()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-lg" : ""
      }`}
    >
      <nav className="glass-pill px-6 py-3 flex items-center justify-between min-w-[800px] max-w-4xl">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/myts-logo.png"
            alt="MyTS Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="font-bold text-lg">MyTS</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <div className="w-20 h-8 bg-muted/50 rounded-md animate-pulse" />
          ) : user ? (
            <Link href="/dashboard">
              <Button size="sm" className="text-sm flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="text-sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="text-sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-4 glass-card rounded-2xl p-6 min-w-[300px]"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                {loading ? (
                  <div className="w-full h-8 bg-muted/50 rounded-md animate-pulse" />
                ) : user ? (
                  <Link href="/dashboard">
                    <Button size="sm" className="text-sm w-full flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <Button variant="ghost" size="sm" className="text-sm w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm" className="text-sm w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
