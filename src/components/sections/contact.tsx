"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react"

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help from our support team",
    contact: "support@ticketflow.com",
    available: "24/7 response within 2 hours"
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our team in real-time",
    contact: "Available in dashboard",
    available: "Mon-Fri, 9AM-6PM EST"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our experts",
    contact: "+1 (555) 123-4567",
    available: "Mon-Fri, 9AM-5PM EST"
  }
]

export function Contact() {
  return (
    <section id="contact" className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="glass-pill mb-4">
            Contact Us
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Get in{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              touch
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about TicketFlow? Our team is here to help you get started 
            with the perfect ticketing solution for your organization.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-6">How can we help?</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Whether you're looking to implement TicketFlow for your organization, 
                need technical support, or want to explore enterprise features, 
                we're here to assist you every step of the way.
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <Card key={index} className="bento-card group">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110">
                      <method.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{method.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                      <p className="font-medium text-primary">{method.contact}</p>
                      <p className="text-xs text-muted-foreground">{method.available}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Office Info */}
            <Card className="bento-card">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Headquarters</h4>
                  <p className="text-sm text-muted-foreground">
                    123 Innovation Drive<br />
                    San Francisco, CA 94102<br />
                    United States
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="bento-card">
              <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <select className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>General Inquiry</option>
                    <option>Sales</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                    <option>Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Tell us about your requirements..."
                  />
                </div>

                <Button className="w-full rounded-xl" size="lg">
                  Send Message
                  <Send className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We'll get back to you within 24 hours. For urgent matters, 
                  please use our live chat or phone support.
                </p>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
