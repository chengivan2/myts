"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ChevronRight } from "lucide-react"
import Image from "next/image"

export function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden mirror-shine">
      {/* Background */}
      <div className="absolute inset-0 mesh-bg-blue" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center space-y-8">
        {/* Announcement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="glass-pill text-sm font-medium">
            Introducing Support for AI Models
            <ChevronRight className="ml-2 h-3 w-3" />
          </Badge>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6 max-w-4xl"
        >
          <h1 className="text-6xl md:text-7xl font-bold leading-tight">
            Modern Solutions for{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Customer Engagement
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Highly customizable components for building modern websites
            and applications that look and feel the way you mean it.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button size="lg" className="text-lg px-8 py-4 rounded-full">
            Start Building
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-4 rounded-full glass-pill">
            Request a demo
          </Button>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="relative mt-20 w-full max-w-6xl"
        >
          <div className="glass-card p-6 rounded-3xl shadow-2xl">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-6 p-4 glass rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <span className="text-sm text-muted-foreground">TicketFlow Dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>

            {/* Dashboard Content - Simplified Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sidebar */}
              <div className="glass-card p-4 space-y-3">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-lg" />
                  <span className="font-semibold">Inbox</span>
                  <Badge className="ml-auto">126</Badge>
                </div>
                {["Drafts", "Sent", "Junk", "Trash", "Archive"].map((item, i) => (
                  <div key={item} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="text-sm">{item}</span>
                    <span className="text-xs text-muted-foreground">{Math.floor(Math.random() * 100)}</span>
                  </div>
                ))}
              </div>

              {/* Main Content */}
              <div className="md:col-span-2 space-y-4">
                {/* Search Bar */}
                <div className="glass p-3 rounded-xl">
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
                
                {/* Ticket List */}
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((ticket) => (
                    <div key={ticket} className="glass-card p-4 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full" />
                            <div className="space-y-1">
                              <div className="h-3 bg-foreground rounded w-24" />
                              <div className="h-2 bg-muted-foreground rounded w-16" />
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded w-full" />
                          <div className="h-2 bg-muted rounded w-2/3" />
                        </div>
                        <div className="text-right space-y-1">
                          <div className="h-2 bg-muted rounded w-16" />
                          <Badge variant="outline" className="text-xs">
                            {ticket % 2 === 0 ? "Urgent" : "Normal"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
