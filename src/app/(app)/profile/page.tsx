"use client"

import { useState } from "react"
import { User, Mail, Camera, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function ProfilePage() {
  const [name, setName] = useState("Nexora User")
  const [email, setEmail] = useState("user@nexora.app")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success("Profile updated!")
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">My Profile</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage your personal information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg">{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--accent-sage)] flex items-center justify-center hover:bg-[var(--accent-teal)] transition-colors">
                <Camera className="h-3 w-3 text-white" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{name}</p>
              <p className="text-xs text-[var(--text-muted)]">{email}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  placeholder="Your full name"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="pl-9"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} loading={saving} className="w-full">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Current Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm New Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button variant="secondary" className="w-full" onClick={() => toast.success("Password updated!")}>
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-[var(--status-error)]">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Delete Account</p>
              <p className="text-xs text-[var(--text-muted)]">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => toast.error("Account deletion requires confirmation email")}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
