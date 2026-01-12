"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/authService"

type Profile = {
  fullName: string
  email: string
  phone: string
}

type Preferences = {
  emailUpdates: boolean
  smsUpdates: boolean
  marketing: boolean
}

const STORAGE_PREFS = "account_prefs"

export function AccountSettings() {
  const { toast } = useToast()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [profile, setProfile] = useState<Profile>({
    fullName: "",
    email: "",
    phone: "",
  })

  const [prefs, setPrefs] = useState<Preferences>({
    emailUpdates: true,
    smsUpdates: false,
    marketing: false,
  })

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Load from API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await authService.getCurrentUser()
        if (user) {
          setProfile({
            fullName: user.name,
            email: user.email,
            phone: user.phone || ""
          })
        }
      } catch (error) {
        console.error("Failed to load profile", error)
        toast({ title: "Failed to load profile", variant: "destructive" })
      }
    }
    loadProfile()
  }, [])



  const persistPrefs = (next: Preferences, showToast = true) => {
    setPrefs(next)
    try {
      localStorage.setItem(STORAGE_PREFS, JSON.stringify(next))
    } catch { }
    if (showToast) toast({ title: "Preferences updated" })
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)

    try {
      await authService.updateProfile({
        name: profile.fullName,
        phone: profile.phone
      })
      toast({ title: "Profile saved", description: "Your profile information has been updated." })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update profile.",
        variant: "destructive"
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validations
    if (!currentPassword) {
      toast({ title: "Current password required", variant: "destructive" })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" })
      return
    }
    // Must match backend validation in /auth/change-password
    // (uppercase, lowercase, number, special character)
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
    if (!strongPassword.test(newPassword)) {
      toast({
        title: "Weak password",
        description: "Use uppercase, lowercase, number, and a special character (@$!%*?&).",
        variant: "destructive",
      })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" })
      return
    }

    setPasswordLoading(true)

    try {
      // Call actual API
      await authService.changePassword(currentPassword, newPassword)

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast({ title: "Password updated", description: "Your password has been changed successfully." })
    } catch (error: any) {
      const backendMessage = Array.isArray(error?.errors) && error.errors.length > 0
        ? error.errors[0]?.message
        : null
      toast({
        title: "Update Failed",
        description: backendMessage || error.message || "Could not update password. Please check your current password.",
        variant: "destructive"
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
        <CardHeader>
          <CardTitle className="text-[#6B4423]">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>

            <Button
              type="submit"
              disabled={profileLoading}
              className="bg-[#2D5F3F] hover:bg-[#234A32] text-white"
            >
              {profileLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
        <CardHeader>
          <CardTitle className="text-[#6B4423]">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input id="confirmNewPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <Button
              type="submit"
              disabled={passwordLoading}
              className="bg-[#2D5F3F] hover:bg-[#234A32] text-white"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
        <CardHeader>
          <CardTitle className="text-[#6B4423]">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-[#E8DCC8] p-3">
            <div>
              <p className="text-sm font-medium text-[#6B4423]">Email updates</p>
              <p className="text-xs text-[#8B6F47]">Order confirmations, delivery, and account alerts</p>
            </div>
            <Switch checked={prefs.emailUpdates} onCheckedChange={(v) => persistPrefs({ ...prefs, emailUpdates: v })} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-[#E8DCC8] p-3">
            <div>
              <p className="text-sm font-medium text-[#6B4423]">SMS updates</p>
              <p className="text-xs text-[#8B6F47]">Delivery and important account alerts</p>
            </div>
            <Switch checked={prefs.smsUpdates} onCheckedChange={(v) => persistPrefs({ ...prefs, smsUpdates: v })} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-[#E8DCC8] p-3">
            <div>
              <p className="text-sm font-medium text-[#6B4423]">Marketing emails</p>
              <p className="text-xs text-[#8B6F47]">News, offers and product updates</p>
            </div>
            <Switch checked={prefs.marketing} onCheckedChange={(v) => persistPrefs({ ...prefs, marketing: v })} />
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="rounded-2xl py-5 border-2 border-[#E8DCC8]">
        <CardHeader>
          <CardTitle className="text-red-600">Delete Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="border-2">Delete My Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account data from this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    //   try {
                    //     localStorage.removeItem(STORAGE_PROFILE)
                    //     localStorage.removeItem(STORAGE_PREFS)
                    //   } catch {}
                    toast({ title: "Account deletion requested", description: "We have queued your deletion request." })
                  }}
                >
                  Confirm Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
