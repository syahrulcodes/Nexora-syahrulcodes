"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})
type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.name },
      },
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Account created! Check your email to verify.")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--accent-sage)]/20">
              <Zap className="w-5 h-5 text-[var(--accent-sage)]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">NEXORA</h1>
          <p className="text-sm text-[var(--text-muted)]">Organize Better. Live Smarter.</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Create Account</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Start your productivity journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input {...register("name")} placeholder="Your name" autoComplete="name" />
              {errors.name && <p className="text-xs text-[var(--status-error)]">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input {...register("email")} type="email" placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="text-xs text-[var(--status-error)]">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[var(--status-error)]">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Confirm Password</Label>
              <Input {...register("confirmPassword")} type="password" placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-xs text-[var(--status-error)]">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create Account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-[var(--text-muted)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--accent-sage)] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
