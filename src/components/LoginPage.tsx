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
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center relative px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle dark={dark} onToggle={onToggleTheme} />
      </div>

      <div className="max-w-sm w-full space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-black dark:text-white tracking-tight">
            Knowledge Base Agent
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            powered by <span className="font-semibold text-black dark:text-white">Funky</span>
          </p>
        </div>

        {/* Value props */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-base">💬</span>
            <div>
              <p className="text-sm font-medium text-black dark:text-white">Chat to build knowledge</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Talk to the agent and it turns your conversations into structured wiki pages.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-base">🔄</span>
            <div>
              <p className="text-sm font-medium text-black dark:text-white">Syncs to your desktop</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Pages sync in real-time to a local folder via Syncthing. Edit anywhere.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-base">📝</span>
            <div>
              <p className="text-sm font-medium text-black dark:text-white">View in Obsidian</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Open the synced folder as an Obsidian vault for a rich wiki experience with links, graphs, and search.
              </p>
            </div>
          </div>
        </div>

        {/* Sign in */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError('Google login failed')}
              theme={dark ? 'filled_black' : 'outline'}
              width="350"
            />
          </div>
          {loading && (
            <p className="text-center text-neutral-400 dark:text-neutral-500 text-sm">
              Signing in...
            </p>
          )}
          {error && (
            <p className="text-center text-red-500 dark:text-red-400 text-sm">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
