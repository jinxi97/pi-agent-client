import { useState } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { loginWithGoogle } from '../api'
import ThemeToggle from './ThemeToggle'

interface LoginPageProps {
  onLogin: (token: string, userId: string) => void
  dark: boolean
  onToggleTheme: () => void
}

export default function LoginPage({ onLogin, dark, onToggleTheme }: LoginPageProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('No credential received from Google')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { token, userId } = await loginWithGoogle(response.credential)
      localStorage.setItem('pi_agent_token', token)
      localStorage.setItem('pi_agent_user_id', userId)
      onLogin(token, userId)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle dark={dark} onToggle={onToggleTheme} />
      </div>
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-black dark:text-white">pi-agent</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Sign in to get started</p>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError('Google login failed')}
            theme={dark ? 'filled_black' : 'outline'}
          />
        </div>
        {loading && <p className="text-neutral-400 dark:text-neutral-500">Signing in...</p>}
        {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
      </div>
    </div>
  )
}
