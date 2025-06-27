"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Ticket, 
  Users, 
  Building2, 
  Zap, 
  Shield, 
  BarChart3,
  MessageSquare,
  Clock,
  Globe
} from "lucide-react"

const features = [
  {
    title: "Multi-Tenant Architecture",
    description: "Each organization gets its own dedicated space with custom branding and domain.",
    icon: Building2,
    size: "bento-lg",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    title: "Smart Ticket Management",
    description: "Unique ticket IDs with organization codes and timestamps.",
    icon: Ticket,
    size: "bento-md",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    title: "Role-Based Access",
    description: "Owners, agents, and customers with different permission levels.",
    icon: Users,
    size: "bento-md",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    title: "Real-time Updates",
    description: "Instant notifications and live status updates.",
    icon: Zap,
    size: "bento-sm",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    title: "Enterprise Security",
    description: "Domain-based email validation and secure access controls.",
    icon: Shield,
    size: "bento-sm",
    gradient: "from-red-500 to-rose-500"
  },
  {
    title: "Analytics Dashboard",
    description: "Comprehensive insights and performance metrics.",
    icon: BarChart3,
    size: "bento-md",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    title: "Customer Portal",
    description: "Self-service ticket submission without authentication required.",
    icon: MessageSquare,
    size: "bento-sm",
    gradient: "from-teal-500 to-cyan-500"
  },
  {
    title: "24/7 Support",
    description: "Round-the-clock availability for your customers.",
    icon: Clock,
    size: "bento-sm",
    gradient: "from-orange-500 to-red-500"
  },
  {
    title: "Global Scale",
    description: "Built to handle organizations of any size worldwide.",
    icon: Globe,
    size: "bento-md",
    gradient: "from-blue-500 to-purple-500"
  }
]

export function Features() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="glass-pill mb-4">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need for{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              modern support
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built from the ground up to handle multi-tenant organizations with 
            enterprise-grade security and performance.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-fr">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`${feature.size}`}
            >
              <Card className="bento-card h-full group cursor-pointer">
                <div className="h-full flex flex-col">
                  {/* Icon and Title */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white transition-transform group-hover:scale-110`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {feature.description}
                  </p>
                  
                  {/* Hover Effect */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary rounded-full" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of organizations already using TicketFlow to streamline their support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                Start Free Trial
              </button>
              <button className="px-8 py-3 glass-pill hover:bg-white/20 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
