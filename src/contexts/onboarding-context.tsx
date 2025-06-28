"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface OnboardingData {
  // Step 1: Organization Details
  organizationName: string
  organizationDescription: string
  
  // Step 2: Subdomain
  subdomain: string
  
  // Step 3: Email Domains
  allowedDomains: string[]
  
  // Step 4: Welcome Message
  customMessage: string
  
  // Metadata
  currentStep: number
  isComplete: boolean
}

interface OnboardingContextType {
  data: OnboardingData
  updateData: (newData: Partial<OnboardingData>) => void
  resetData: () => void
  saveToStorage: () => void
  loadFromStorage: () => void
}

const defaultData: OnboardingData = {
  organizationName: '',
  organizationDescription: '',
  subdomain: '',
  allowedDomains: [],
  customMessage: '',
  currentStep: 1,
  isComplete: false,
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData)

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }))
  }

  const resetData = () => {
    setData(defaultData)
    localStorage.removeItem('onboarding-data')
  }

  const saveToStorage = () => {
    localStorage.setItem('onboarding-data', JSON.stringify(data))
  }

  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('onboarding-data')
      if (saved) {
        const parsedData = JSON.parse(saved)
        setData(prev => ({ ...prev, ...parsedData }))
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error)
    }
  }

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    if (data.organizationName || data.subdomain || data.allowedDomains.length > 0) {
      saveToStorage()
    }
  }, [data])

  // Load from localStorage on mount
  useEffect(() => {
    loadFromStorage()
  }, [])

  return (
    <OnboardingContext.Provider value={{
      data,
      updateData,
      resetData,
      saveToStorage,
      loadFromStorage
    }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
