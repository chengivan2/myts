"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface Step {
  id: number
  title: string
  description: string
}

interface ProgressIndicatorProps {
  currentStep: number
  steps: Step[]
}

export function ProgressIndicator({ currentStep, steps }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300 relative
                    ${isCompleted 
                      ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white" 
                      : isCurrent
                      ? "bg-gradient-to-br from-primary to-secondary text-white ring-4 ring-primary/20"
                      : "glass text-muted-foreground"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    stepNumber
                  )}
                </motion.div>
                
                {/* Step Info */}
                <div className="mt-3 text-center">
                  <div className={`
                    text-sm font-medium
                    ${isCurrent ? "text-foreground" : "text-muted-foreground"}
                  `}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 max-w-[120px]">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className={`
                    h-0.5 transition-all duration-500
                    ${isCompleted ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-border"}
                  `} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
