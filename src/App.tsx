import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import ChatLayout from './components/ChatLayout'

function App() {
  const [token, setToken] = useState<string | null>(null)
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('pi_agent_theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    const saved = localStorage.getItem('pi_agent_token')
    if (saved) setToken(saved)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('pi_agent_theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggleTheme = () => setDark((v) => !v)

  const handleLogin = (newToken: string, _userId: string) => {
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('pi_agent_token')
    localStorage.removeItem('pi_agent_user_id')
    setToken(null)
  }

  if (!token) {
    return <LoginPage onLogin={handleLogin} dark={dark} onToggleTheme={toggleTheme} />
  }

  return <ChatLayout onLogout={handleLogout} dark={dark} onToggleTheme={toggleTheme} />
}

export default App
