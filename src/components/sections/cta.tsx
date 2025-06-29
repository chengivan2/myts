"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, Clock } from "lucide-react"

export function CTA() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Background with mesh */}
          <div className="absolute inset-0 mesh-bg-blue rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-3xl" />
          
          {/* Content */}
          <div className="relative glass-card p-12 rounded-3xl text-center mirror-shine">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Main Heading */}
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                  Ready to transform your{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    customer support?
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Join thousands of organizations using TicketFlow to deliver exceptional 
                  customer experiences. Get started in minutes, not weeks.
                </p>
              </div>

              {/* Features Pills */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {[
                  { icon: Zap, text: "Setup in 5 minutes" },
                  { icon: Shield, text: "Enterprise security" },
                  { icon: Clock, text: "24/7 support" }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="glass-pill flex items-center space-x-2"
                  >
                    <feature.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4 rounded-full glass-pill hover:bg-white/20 transition-all"
                >
                  Schedule Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-4">
                  Trusted by organizations worldwide
                </p>
                <div className="flex justify-center items-center space-x-8 opacity-60">
                  {/* Placeholder company logos */}
                  {["TechCorp", "StartupFlow", "GlobalServices", "InnovateNow"].map((company, index) => (
                    <div key={index} className="text-xs font-semibold tracking-wider">
                      {company}
                    </div>
                  ))}
                </div>
              </div>

              {/* Small Print */}
              <p className="text-xs text-muted-foreground max-w-2xl mx-auto pt-4">
                No credit card required • Free 14-day trial • Cancel anytime • 
                Get full access to all features including multi-tenant architecture and enterprise security
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
