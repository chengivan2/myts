"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  User,
  Mail,
  Bell,
  Shield,
  Palette,
  Save,
  LogOut
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  email: string
  user_metadata: {
    full_name?: string
  }
}

interface UserPreferences {
  email_notifications: boolean
  push_notifications: boolean
  theme: 'light' | 'dark' | 'system'
  timezone: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: true,
    push_notifications: true,
    theme: 'system',
    timezone: 'UTC'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const supabase = createClient()
      
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      if (!user) {
        router.push('/auth/signin')
        return
      }

      setUser(user as UserProfile)
      setFullName(user.user_metadata?.full_name || '')
      
      // Load user preferences (this would come from a user_preferences table in a real app)
      // For now, using localStorage as a fallback
      const savedPrefs = localStorage.getItem('user_preferences')
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs))
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load user settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName
        }
      })
      
      if (error) throw error
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = () => {
    try {
      // In a real app, this would save to a database
      localStorage.setItem('user_preferences', JSON.stringify(preferences))
      toast.success('Preferences saved successfully!')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences')
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <Settings className="h-8 w-8 mr-3 text-primary" />
          Account Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your personal account preferences and settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed from here. Contact support if needed.
                </p>
              </div>
              
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <Button onClick={handleSaveProfile} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </Card>

          {/* Notification Preferences */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Preferences
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about ticket updates via email
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.email_notifications}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    email_notifications: e.target.checked
                  })}
                  className="w-4 h-4"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive browser notifications for important updates
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.push_notifications}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    push_notifications: e.target.checked
                  })}
                  className="w-4 h-4"
                />
              </div>
              
              <Button onClick={handleSavePreferences}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Appearance
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={preferences.theme}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    theme: e.target.value as 'light' | 'dark' | 'system'
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    timezone: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
              
              <Button onClick={handleSavePreferences}>
                <Save className="h-4 w-4 mr-2" />
                Save Appearance
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Account Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account Type</span>
                <span className="text-sm font-medium">Personal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm font-medium">
                  {new Date(user.id ? '2024-01-01' : Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email Verified</span>
                <span className="text-sm font-medium text-green-600">Yes</span>
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Download Data
              </Button>
            </div>
          </Card>

          {/* Sign Out */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
