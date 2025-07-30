"use client"

import { AuthForm } from '@/__components-app/auth-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

type Props = {}

const page = (props: Props) => {
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('signup');
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to the Auth Page</h1>
      <p className="mb-4">This is a placeholder for the authentication page.</p>
      <p className="mb-4">You can implement your authentication logic here.</p>
      <Button className="mt-2">
        <Link href="/">Go to Home</Link>
      </Button>
      <Button className="mt-2" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
        Switch to {authMode === 'login' ? 'Signup' : 'Login'}
      </Button>
      <AuthForm mode={authMode} fields={authMode === 'login' ? [
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
      ] : [
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'username', label: 'Username', type: 'text', required: true },
        { name: 'avatar_url', label: 'Avatar URL', type: 'text', required: false },
      ]} />

    </div>
  )
}

export default page