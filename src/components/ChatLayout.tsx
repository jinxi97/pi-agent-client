import { useState, useEffect, useCallback } from 'react'
import type { Session, Message, WorkspaceInfo } from '../types'
import {
  createDemoWorkspace,
  pollWorkspaceStatus,
  createSession as apiCreateSession,
  listSessions as apiListSessions,
  getSession as apiGetSession,
} from '../api'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import ThemeToggle from './ThemeToggle'
import Onboarding from './Onboarding'

interface ChatLayoutProps {
  onLogout: () => void
  dark: boolean
  onToggleTheme: () => void
}

export default function ChatLayout({ onLogout, dark, onToggleTheme }: ChatLayoutProps) {
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null)
  const [provisionStatus, setProvisionStatus] = useState('Initializing...')
  const [error, setError] = useState<string | null>(null)

  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem('pi_agent_onboarding_complete') === 'true',
  )

  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // ── Workspace provisioning ───────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false

    async function provision() {
      try {
        setProvisionStatus('Creating workspace...')
        const result = await createDemoWorkspace()

        if (!result.claimName) {
          setError('Workspace exists but claim name is missing')
          return
        }

        const claimName = result.claimName
        const namespace = result.namespace

        if (result.status === 'exists') {
          setProvisionStatus('Connecting to workspace...')
        } else {
          setProvisionStatus('Provisioning workspace...')
        }

        const podName = await pollWorkspaceStatus(
          claimName,
          namespace,
          (status) => {
            if (!cancelled) setProvisionStatus(`Workspace: ${status}`)
          },
        )

        if (!cancelled) {
          setWorkspace({ claimName, namespace, podName })
          setProvisionStatus('')
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message)
      }
    }

    provision()
    return () => { cancelled = true }
  }, [])

  // ── Load sessions once workspace is ready ────────────────────────────────

  useEffect(() => {
    if (!workspace || !onboardingDone) return

    apiListSessions(workspace)
      .then(async (loaded) => {
        setSessions(loaded)
        if (loaded.length === 0) {
          const session = await apiCreateSession(workspace)
          setSessions([session])
          setActiveSessionId(session.id)
        }
      })
      .catch(console.error)
  }, [workspace, onboardingDone])

  // ── Load messages when switching sessions ────────────────────────────────

  useEffect(() => {
    if (!workspace || !activeSessionId) {
      setMessages([])
      return
    }

    apiGetSession(workspace, activeSessionId)
      .then((data) => {
        const msgs: Message[] = []
        for (const m of data.messages || []) {
          if (m.role === 'user') {
            const text = m.content
              ?.filter((c: { type: string }) => c.type === 'text')
              .map((c: { text?: string }) => c.text || '')
              .join('') || ''
            if (text) msgs.push({ role: 'user', text })
          } else if (m.role === 'assistant') {
            // Extract text content
            const text = m.content
              ?.filter((c: { type: string }) => c.type === 'text')
              .map((c: { text?: string }) => c.text || '')
              .join('') || ''
            if (text) msgs.push({ role: 'assistant', text })

            // Extract tool_use blocks as tool messages
            for (const block of m.content || []) {
              if (block.type === 'tool_use' || block.type === 'toolUse') {
                const toolName = block.name || block.toolName || 'tool'
                const toolArgs = block.input || block.args
                msgs.push({ role: 'tool', text: '', toolName, toolArgs })
              }
            }
          } else if (m.role === 'toolResult') {
            const toolName = (m as { toolName?: string }).toolName || 'tool'
            const resultText = m.content
              ?.filter((c: { type: string }) => c.type === 'text')
              .map((c: { text?: string }) => c.text || '')
              .join('\n') || ''
            // Find the matching pending tool message and update it
            const idx = msgs.findLastIndex(
              (msg) => msg.role === 'tool' && msg.toolName === toolName && msg.text !== 'done',
            )
            if (idx >= 0) {
              msgs[idx] = { ...msgs[idx], text: 'done', toolResult: resultText, toolIsError: !!(m as { isError?: boolean }).isError }
            } else {
              msgs.push({ role: 'tool', text: 'done', toolName, toolResult: resultText, toolIsError: !!(m as { isError?: boolean }).isError })
            }
          }
        }
        setMessages(msgs)
      })
      .catch(console.error)
  }, [workspace, activeSessionId])

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleNewSession = useCallback(async () => {
    if (!workspace) return
    try {
      const session = await apiCreateSession(workspace)
      setSessions((prev) => [session, ...prev])
      setActiveSessionId(session.id)
      setMessages([])
    } catch (err) {
      console.error('Failed to create session:', err)
    }
  }, [workspace])

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id)
  }, [])

  // ── Provisioning / error states ──────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-600 border-t-black dark:border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">{provisionStatus}</p>
        </div>
      </div>
    )
  }

  // ── Onboarding (one-time) ─────────────────────────────────────────────────

  if (!onboardingDone) {
    return (
      <Onboarding
        workspace={workspace}
        onComplete={() => setOnboardingDone(true)}
      />
    )
  }

  // ── Main layout ──────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-white dark:bg-black flex">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800">
          <ThemeToggle dark={dark} onToggle={onToggleTheme} />
          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-xs text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
          >
            Log out
          </button>
        </div>
        <ChatArea
          workspace={workspace}
          sessionId={activeSessionId}
          messages={messages}
          onMessagesChange={setMessages}
        />
      </div>
    </div>
  )
}
