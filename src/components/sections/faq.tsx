"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    question: "What is multi-tenant architecture and how does it benefit my organization?",
    answer: "Multi-tenant architecture means each organization gets its own isolated space within our system. Your data, branding, domain (slug.ticketflow.com), and settings are completely separate from other organizations. This ensures security, customization, and scalability while keeping costs efficient."
  },
  {
    question: "How do the unique ticket IDs work?",
    answer: "Each ticket gets a unique ID format: [ORG-CODE][RANDOM-NUMBER][TIMESTAMP]. For example: 'ABC123456789012345'. The first 3 letters are your organization's identifier, followed by a random number and timestamp. This ensures every ticket is uniquely identifiable and traceable."
  },
  {
    question: "What's the difference between organization owners and agents?",
    answer: "Organization owners create and manage the organization, add/remove agents, configure settings, and have full administrative access. Agents can only manage tickets, respond to customers, and view analytics. Both must use work emails from your organization's approved domain list."
  },
  {
    question: "Do customers need to create accounts to submit tickets?",
    answer: "No! Customers can submit tickets without any authentication. They simply visit your organization's portal, fill out the form, and receive a unique ticket ID. They can later check their ticket status using just the ticket ID - no account required."
  },
  {
    question: "How does domain-based email validation work?",
    answer: "When setting up your organization, you specify allowed email domains (e.g., @yourcompany.com). Only users with emails from these domains can be added as owners or agents. This ensures only your employees can access your organization's ticketing system."
  },
  {
    question: "Can I customize the branding for my organization?",
    answer: "Yes! Each organization can customize their portal with their own branding, colors, logo, and domain slug. Your customers will see a fully branded experience that matches your company's identity."
  },
  {
    question: "What analytics and reporting features are available?",
    answer: "Our dashboard provides comprehensive analytics including ticket volume, response times, agent performance, customer satisfaction scores, peak hours analysis, and resolution rates. All data is specific to your organization and can be exported for further analysis."
  },
  {
    question: "Is my organization's data secure and private?",
    answer: "Absolutely. Each organization's data is completely isolated using enterprise-grade security measures. We use encryption in transit and at rest, role-based access controls, and regular security audits. Your data is never shared with other organizations."
  },
  {
    question: "How do I get started with TicketFlow?",
    answer: "Getting started is simple: 1) Register with your personal email, 2) Create your organization and add your work email, 3) Set up your allowed domains, 4) Invite agents, 5) Customize your portal. Your ticketing system will be ready in minutes!"
  },
  {
    question: "What happens if I need to add more agents later?",
    answer: "You can add or remove agents anytime from your organization dashboard. Simply send invitations to work emails from your approved domains. New agents get immediate access to your ticketing system with the appropriate permissions."
  }
]

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <section id="faq" className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="glass-pill mb-4">
            FAQ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about TicketFlow's multi-tenant ticketing system.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="glass-card transition-all duration-300 hover:shadow-lg">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left flex items-center justify-between focus:outline-none"
                >
                  <h3 className="font-semibold text-lg pr-8">{faq.question}</h3>
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                
                {openItems.includes(index) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <div className="h-px bg-border mb-4" />
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help you get started with TicketFlow.
            </p>
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
