import { useState, useEffect } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'

const API_URL = 'http://127.0.0.1:8000'

function App() {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('pi_agent_token')
    const savedUserId = localStorage.getItem('pi_agent_user_id')
    if (savedToken && savedUserId) {
      setToken(savedToken)
      setUserId(savedUserId)
    }
  }, [])

  const handleLogin = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('No credential received from Google')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: response.credential }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Login failed')
      }

      const data = await res.json()
      localStorage.setItem('pi_agent_token', data.token)
      localStorage.setItem('pi_agent_user_id', data.user_id)
      setToken(data.token)
      setUserId(data.user_id)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('pi_agent_token')
    localStorage.removeItem('pi_agent_user_id')
    setToken(null)
    setUserId(null)
  }

  if (token) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">pi-agent</h1>
          <p className="text-gray-400">Logged in as {userId}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-white">pi-agent</h1>
        <p className="text-gray-400">Sign in to get started</p>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleLogin}
            onError={() => setError('Google login failed')}
          />
        </div>
        {loading && <p className="text-gray-500">Signing in...</p>}
        {error && <p className="text-red-400">{error}</p>}
      </div>
    </div>
  )
}

export default App
