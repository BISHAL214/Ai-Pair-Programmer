'use client'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

export default function Page() {
  const { user, loading, supabase } = useAuth()

  if (loading) return <p>Loading...</p>
  // if (!user) return <p>You must be logged in</p>

  return (
    <div>
      <Button>
        <Link href="/auth">
          login
        </Link>
      </Button>
      <p>Welcome, {user?.email}</p>
      <button onClick={() => supabase.auth.signOut()}>Logout</button>
    </div>
  )
}
