'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabaseAnonKey, supabaseUrl } from '@/constants'
import { createSupabaseBrowserClient } from '@ai_pair_programmer/supabse-client'
import { motion } from 'framer-motion'
import { Github, Loader2, Mail } from 'lucide-react'
import { useState } from 'react'

type AuthFormProps = {
  mode: 'login' | 'signup'
  fields?: {
    name: string
    label: string
    type: string
    required?: boolean
  }[]
  showOAuth?: boolean
  onSuccess?: () => void
}

export const AuthForm = ({
  mode,
  fields = [
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ],
  showOAuth = true,
  onSuccess,
}: AuthFormProps) => {
  const supabase = createSupabaseBrowserClient(supabaseUrl as string, supabaseAnonKey as string)
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.full_name,
              username: form.username,
              avatar_url: form.avatar_url || '',
              email: form.email,
            },
          },
        })
        if (error) throw error
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (error || !data.session) throw error || new Error('No session found')
      }

      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const signInWithProvider = async (provider: 'google' | 'github') => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) setError(error.message)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md space-y-6 p-6 border z-10 rounded-2xl shadow-sm bg-white dark:bg-zinc-950"
    >
      <h2 className="text-2xl font-semibold tracking-tight capitalize">
        {mode === 'signup' ? 'Create an account' : 'Sign in to your account'}
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        className="space-y-4"
      >
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              required={field.required}
              value={form[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          </div>
        ))}

        <div className="flex items-center space-x-2">
          <Checkbox id="remember" checked={rememberMe} onCheckedChange={() => setRememberMe(!rememberMe)} />
          <label htmlFor="remember" className="text-sm leading-none peer-disabled:cursor-not-allowed">
            Remember me
          </label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'signup' ? 'Sign Up' : 'Log In'}
        </Button>
      </form>

      {showOAuth && (
        <div className="space-y-2">
          <div className="text-center text-sm text-muted-foreground">Or continue with</div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signInWithProvider('google')}
              disabled={loading}
            >
              <Mail className="w-4 h-4 mr-2" /> Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signInWithProvider('github')}
              disabled={loading}
            >
              <Github className="w-4 h-4 mr-2" /> GitHub
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
