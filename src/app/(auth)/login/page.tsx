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

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Welcome back!")
    router.push("/dashboard")
    router.refresh()
  }

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    // For demo, just navigate to dashboard (store is localStorage based)
    await new Promise((r) => setTimeout(r, 500))
    setDemoLoading(false)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--accent-sage)]/20">
              <Zap className="w-5 h-5 text-[var(--accent-sage)]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">NEXORA</h1>
          <p className="text-sm text-[var(--text-muted)]">Organize Better. Live Smarter.</p>
        </div>

        {/* Form */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Sign In</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-[var(--status-error)]">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[var(--status-error)]">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--bg-card)] px-2 text-[var(--text-muted)]">or</span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleDemoLogin}
            loading={demoLoading}
          >
            Continue Without Account (Demo)
          </Button>

          <p className="text-center text-xs text-[var(--text-muted)]">
            No account?{" "}
            <Link href="/register" className="text-[var(--accent-sage)] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
