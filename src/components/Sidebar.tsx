import type { Session } from '../types'

interface SidebarProps {
  sessions: Session[]
  activeSessionId: string | null
  collapsed: boolean
  onToggle: () => void
  onSelectSession: (id: string) => void
  onNewSession: () => void
}

export default function Sidebar({
  sessions,
  activeSessionId,
  collapsed,
  onToggle,
  onSelectSession,
  onNewSession,
}: SidebarProps) {
  return (
    <div
      className={`h-full bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-all duration-200 ${
        collapsed ? 'w-12' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800">
        {!collapsed && (
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Sessions</span>
        )}
        <button
          onClick={onToggle}
          className="p-1 text-neutral-400 hover:text-black dark:hover:text-white rounded transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* New Session button */}
      {!collapsed && (
        <div className="p-2">
          <button
            onClick={onNewSession}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Session
          </button>
        </div>
      )}

      {/* Collapsed: just show + icon */}
      {collapsed && (
        <div className="p-2">
          <button
            onClick={onNewSession}
            className="w-full flex justify-center p-2 text-neutral-400 hover:text-black dark:hover:text-white rounded transition-colors"
            title="New Session"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Session list */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                activeSessionId === session.id
                  ? 'bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {session.firstMessage || 'New session'}
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="text-xs text-neutral-400 dark:text-neutral-600 text-center py-4">
              No sessions yet
            </p>
          )}
        </div>
      )}
    </div>
  )
}
