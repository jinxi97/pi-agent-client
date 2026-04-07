export interface Session {
  id: string
  model: string
  createdAt: number
  updatedAt: number
  messageCount: number
  firstMessage: string
}

export interface Message {
  role: 'user' | 'assistant' | 'tool'
  text: string
  toolName?: string
  toolArgs?: Record<string, unknown>
  toolResult?: string
  toolIsError?: boolean
}

export interface WorkspaceInfo {
  claimName: string
  namespace: string
  podName: string
}

export interface ToolExecution {
  toolName: string
  args?: Record<string, unknown>
}
