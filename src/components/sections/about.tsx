"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Target, Users, Lightbulb, Shield, Rocket, Heart } from "lucide-react"

const values = [
  {
    icon: Target,
    title: "Customer-Centric",
    description: "Every feature we build starts with a real customer problem. We listen, learn, and deliver solutions that make a difference."
  },
  {
    icon: Shield,
    title: "Security First",
    description: "Multi-tenant isolation, enterprise-grade encryption, and compliance with industry standards protect your data at every level."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously push boundaries with glassmorphism design, AI-powered insights, and cutting-edge architecture patterns."
  },
  {
    icon: Users,
    title: "Scalability",
    description: "From startups to enterprises, our platform grows with you. Add organizations, agents, and features without limits."
  }
]

const team = [
  {
    name: "Alex Morgan",
    role: "CEO & Co-Founder",
    bio: "10+ years building enterprise software. Previously led engineering at major SaaS companies.",
    initials: "AM"
  },
  {
    name: "Jordan Smith",
    role: "CTO & Co-Founder", 
    bio: "Full-stack architect specializing in multi-tenant systems and scalable infrastructure.",
    initials: "JS"
  },
  {
    name: "Casey Johnson",
    role: "Head of Product",
    bio: "UX expert passionate about creating intuitive experiences for complex enterprise workflows.",
    initials: "CJ"
  },
  {
    name: "Riley Chen",
    role: "Lead Engineer",
    bio: "Security specialist ensuring enterprise-grade protection across all TicketFlow systems.",
    initials: "RC"
  }
]

export function About() {
  return (
    <section id="about" className="py-24 px-4">
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
            About Us
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Building the{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              future
            </span>{" "}
            of customer support
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            TicketFlow was born from the frustration of managing customer support across multiple organizations 
            with existing tools that weren't built for modern, multi-tenant workflows.
          </p>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Our Story</h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  In 2023, our founders were running a growing consultancy serving multiple clients. 
                  Each client needed their own branded support portal, but existing solutions forced 
                  them to either compromise on branding or pay for separate expensive enterprise plans.
                </p>
                <p>
                  The breaking point came when a client's sensitive ticket was accidentally visible 
                  to another organization due to inadequate tenant isolation. That night, we started 
                  building TicketFlow.
                </p>
                <p>
                  Today, TicketFlow powers support for thousands of organizations worldwide, from 
                  bootstrapped startups to Fortune 500 companies. Every feature is battle-tested 
                  by real teams solving real problems.
                </p>
              </div>
            </div>
            <div className="glass-card p-8 rounded-3xl">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
                    2023
                  </div>
                  <div>
                    <div className="font-semibold">TicketFlow Founded</div>
                    <div className="text-sm text-muted-foreground">Started with a vision for better multi-tenant support</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                    100+
                  </div>
                  <div>
                    <div className="font-semibold">First 100 Organizations</div>
                    <div className="text-sm text-muted-foreground">Rapid adoption across multiple industries</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                    10K+
                  </div>
                  <div>
                    <div className="font-semibold">Today</div>
                    <div className="text-sm text-muted-foreground">Serving organizations of all sizes globally</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-center mb-12">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="bento-card group text-center">
                <div className="h-full flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white mb-4 transition-transform group-hover:scale-110">
                    <value.icon className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-lg mb-3">{value.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {value.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-center mb-12">Meet Our Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="bento-card group text-center">
                <div className="h-full flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 transition-transform group-hover:scale-110">
                    {member.initials}
                  </div>
                  <h4 className="font-semibold text-lg mb-1">{member.name}</h4>
                  <div className="text-primary font-medium mb-3">{member.role}</div>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {member.bio}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="glass-card p-12 rounded-3xl text-center">
            <Heart className="h-12 w-12 text-primary mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              To democratize enterprise-grade customer support tools for organizations of all sizes. 
              We believe every business deserves professional, secure, and scalable support infrastructure 
              without the complexity or cost traditionally associated with enterprise solutions.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
