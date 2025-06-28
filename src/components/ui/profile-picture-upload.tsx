"use client"

import { useState, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"
import { Button } from "./button"
import { Label } from "./label"
import { Camera, Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string | null
  userId: string
  fullName?: string
  onAvatarUpdate?: (newAvatarUrl: string | null) => void
}

export function ProfilePictureUpload({ 
  currentAvatarUrl, 
  userId, 
  fullName,
  onAvatarUpdate 
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    setIsUploading(true)
    try {
      const supabase = createClient()
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath)

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      // Also update auth user metadata
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (authUpdateError) {
        console.warn('Failed to update auth metadata:', authUpdateError)
      }

      // Delete old avatar if it exists and is different
      if (currentAvatarUrl && currentAvatarUrl !== publicUrl) {
        try {
          // Extract the file path from the URL
          const urlParts = currentAvatarUrl.split('/user-avatars/')
          if (urlParts.length > 1) {
            const oldFilePath = urlParts[1]
            await supabase.storage
              .from('user-avatars')
              .remove([oldFilePath])
          }
        } catch (error) {
          console.warn('Failed to delete old avatar:', error)
        }
      }

      setPreviewUrl(publicUrl)
      onAvatarUpdate?.(publicUrl)
      toast.success('Profile picture updated successfully!')

    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload profile picture')
      setPreviewUrl(currentAvatarUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const removeAvatar = async () => {
    setIsUploading(true)
    try {
      const supabase = createClient()

      // Update user profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      // Also update auth user metadata
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      })

      if (authUpdateError) {
        console.warn('Failed to update auth metadata:', authUpdateError)
      }

      // Delete the file from storage
      if (currentAvatarUrl) {
        try {
          // Extract the file path from the URL
          const urlParts = currentAvatarUrl.split('/user-avatars/')
          if (urlParts.length > 1) {
            const filePath = urlParts[1]
            await supabase.storage
              .from('user-avatars')
              .remove([filePath])
          }
        } catch (error) {
          console.warn('Failed to delete avatar file:', error)
        }
      }

      setPreviewUrl(null)
      onAvatarUpdate?.(null)
      toast.success('Profile picture removed successfully!')

    } catch (error) {
      console.error('Error removing avatar:', error)
      toast.error('Failed to remove profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Profile Picture</Label>
      
      <div className="flex items-center space-x-4">
        {/* Avatar Preview */}
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={previewUrl || undefined} alt="Profile picture" />
            <AvatarFallback className="text-lg">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center"
          >
            {previewUrl ? (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </>
            )}
          </Button>

          {previewUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={removeAvatar}
              disabled={isUploading}
              className="flex items-center text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        Recommended: Square image, at least 200x200px. Max file size: 2MB.
      </p>
    </div>
  )
}
