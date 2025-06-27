"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "IT Director",
    company: "TechCorp Solutions",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b002?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    content: "TicketFlow transformed our customer support. The multi-tenant architecture means each of our departments can have their own branded portal while we maintain central oversight. Our response times improved by 60%."
  },
  {
    name: "Michael Chen",
    role: "Customer Success Manager",
    company: "StartupFlow Inc",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    content: "The unique ticket ID system is brilliant. Our customers love being able to track their issues without creating accounts. The domain-based email validation keeps our team secure while staying user-friendly."
  },
  {
    name: "Emma Rodriguez",
    role: "Operations Manager",
    company: "GlobalServices Ltd",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    content: "Setting up TicketFlow was incredibly easy. Within minutes, we had our branded portal live with custom domain. The analytics dashboard gives us insights we never had before. Highly recommended!"
  },
  {
    name: "David Park",
    role: "CEO",
    company: "InnovateNow",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    content: "As a growing startup, we needed a solution that could scale with us. TicketFlow's role-based access and multi-tenant architecture means we can serve multiple clients efficiently without compromising security."
  },
  {
    name: "Lisa Thompson",
    role: "Support Team Lead",
    company: "CloudSystems Pro",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    content: "The glassmorphism design isn't just beautiful - it's functional. Our agents love the intuitive interface, and customers frequently compliment our professional-looking support portal."
  },
  {
    name: "James Wilson",
    role: "Technical Lead",
    company: "DataDriven Corp",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    content: "The enterprise security features give us peace of mind. With sensitive client data, we needed bulletproof isolation between organizations. TicketFlow delivers exactly that while maintaining excellent performance."
  }
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4">
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
            Testimonials
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              thousands
            </span>{" "}
            of organizations
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what our customers are saying about TicketFlow's impact on their support operations.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bento-card h-full group">
                <div className="h-full flex flex-col">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="h-8 w-8 text-primary/60" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary rounded-full" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "10k+", label: "Organizations Trust Us" },
              { number: "98%", label: "Customer Satisfaction" },
              { number: "24/7", label: "Support Availability" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="glass-card p-6 rounded-3xl">
                  <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
