import type { Session, WorkspaceInfo } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function getToken(): string | null {
  return localStorage.getItem('pi_agent_token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `API error: ${res.status}`)
  }
  return res
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function loginWithGoogle(
  idToken: string,
): Promise<{ userId: string; token: string }> {
  const res = await apiFetch('/account', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  })
  const data = await res.json()
  return { userId: data.user_id, token: data.token }
}

// ── Workspace ────────────────────────────────────────────────────────────────

export async function createDemoWorkspace(): Promise<{
  workspaceId: string
  claimName: string | null
  status: string
  namespace: string
}> {
  const res = await apiFetch('/pi-agent/workspaces-with-pi-agent-demo', {
    method: 'POST',
  })
  const data = await res.json()
  return {
    workspaceId: data.workspace_id,
    claimName: data.claim_name,
    status: data.status,
    namespace: data.namespace,
  }
}

/**
 * Poll workspace status until the pod is Running and pod_name is available.
 * Returns the pod_name.
 */
export async function pollWorkspaceStatus(
  claimName: string,
  namespace: string,
  onStatus: (status: string) => void,
): Promise<string> {
  const maxAttempts = 60
  const intervalMs = 3000

  for (let i = 0; i < maxAttempts; i++) {
    const res = await apiFetch(
      `/pi-agent/workspaces/${claimName}/status?namespace=${namespace}`,
    )
    const data = await res.json()
    onStatus(data.status)

    if (data.status === 'Running' && data.pod_name) {
      return data.pod_name
    }

    if (data.status === 'Failed' || data.status === 'Deleted') {
      throw new Error(`Workspace ${data.status}`)
    }

    await new Promise((r) => setTimeout(r, intervalMs))
  }

  throw new Error('Workspace did not become ready in time')
}

// ── Sessions ─────────────────────────────────────────────────────────────────

function wsQuery(ws: WorkspaceInfo): string {
  return `namespace=${ws.namespace}&pod_name=${ws.podName}`
}

// ── Syncthing ────────────────────────────────────────────────────────────────

export async function exposeSyncthing(
  ws: WorkspaceInfo,
): Promise<{ serviceName: string; status: string; externalIp: string | null }> {
  const res = await apiFetch(
    `/pi-agent/workspaces/${ws.claimName}/syncthing/expose?${wsQuery(ws)}`,
    { method: 'POST' },
  )
  const data = await res.json()
  return {
    serviceName: data.service_name,
    status: data.status,
    externalIp: data.external_ip,
  }
}

export async function getSyncthingInfo(
  ws: WorkspaceInfo,
): Promise<{
  serviceName: string
  externalIp: string | null
  syncAddress: string | null
  deviceId: string | null
  folderId: string
}> {
  const res = await apiFetch(
    `/pi-agent/workspaces/${ws.claimName}/syncthing/info?${wsQuery(ws)}`,
  )
  const data = await res.json()
  return {
    serviceName: data.service_name,
    externalIp: data.external_ip,
    syncAddress: data.sync_address,
    deviceId: data.device_id,
    folderId: data.folder_id,
  }
}

export async function pairSyncthing(
  podName: string,
  namespace: string,
  deviceId: string,
  deviceName: string = 'desktop',
): Promise<{ status: string }> {
  const res = await apiFetch(
    `/pi-agent/syncthing/pair?namespace=${namespace}&pod_name=${podName}`,
    {
      method: 'POST',
      body: JSON.stringify({ device_id: deviceId, device_name: deviceName }),
    },
  )
  const data = await res.json()
  return { status: data.status }
}

export async function createSession(ws: WorkspaceInfo): Promise<Session> {
  const res = await apiFetch(
    `/pi-agent/workspaces/${ws.claimName}/sessions?${wsQuery(ws)}`,
    { method: 'POST', body: JSON.stringify({}) },
  )
  const data = await res.json()
  return {
    id: data.sessionId,
    model: data.model || 'unknown',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messageCount: 0,
    firstMessage: '',
  }
}

export async function listSessions(ws: WorkspaceInfo): Promise<Session[]> {
  const res = await apiFetch(
    `/pi-agent/workspaces/${ws.claimName}/sessions?${wsQuery(ws)}`,
  )
  const data = await res.json()
  return (data.sessions || []).map((s: Record<string, unknown>) => ({
    id: s.id as string,
    model: s.model as string,
    createdAt: s.createdAt as number,
    updatedAt: s.updatedAt as number,
    messageCount: s.messageCount as number,
    firstMessage: s.firstMessage as string,
  }))
}

export async function getSession(
  ws: WorkspaceInfo,
  sessionId: string,
): Promise<{ messages: Array<{ role: string; content: Array<{ type: string; text?: string }> }> }> {
  const res = await apiFetch(
    `/pi-agent/workspaces/${ws.claimName}/sessions/${sessionId}?${wsQuery(ws)}`,
  )
  return res.json()
}

// ── Streaming messages ───────────────────────────────────────────────────────

export interface SSECallbacks {
  onTextDelta: (delta: string) => void
  onToolStart: (toolName: string) => void
  onToolEnd: (toolName: string) => void
  onDone: () => void
  onError: (error: string) => void
}

export async function sendMessage(
  ws: WorkspaceInfo,
  sessionId: string,
  text: string,
  callbacks: SSECallbacks,
): Promise<void> {
  const res = await fetch(
    `${API_URL}/pi-agent/workspaces/${ws.claimName}/sessions/${sessionId}/messages?${wsQuery(ws)}`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text }),
    },
  )

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    callbacks.onError(body.detail || `API error: ${res.status}`)
    return
  }

  const reader = res.body?.getReader()
  if (!reader) {
    callbacks.onError('No response body')
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Parse SSE: lines separated by \n\n
    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''

    for (const part of parts) {
      let eventType = ''
      let dataStr = ''
      for (const line of part.split('\n')) {
        if (line.startsWith('event: ')) eventType = line.slice(7)
        else if (line.startsWith('data: ')) dataStr = line.slice(6)
      }

      if (!dataStr) continue

      try {
        const data = JSON.parse(dataStr)

        if (eventType === 'message_update' && data.assistantMessageEvent) {
          const evt = data.assistantMessageEvent
          if (evt.type === 'text_delta' && evt.delta) {
            callbacks.onTextDelta(evt.delta)
          }
        } else if (eventType === 'tool_execution_start') {
          callbacks.onToolStart(data.toolName || 'tool')
        } else if (eventType === 'tool_execution_end') {
          callbacks.onToolEnd(data.toolName || 'tool')
        } else if (eventType === 'agent_end') {
          callbacks.onDone()
        } else if (eventType === 'error') {
          callbacks.onError(data.error || 'Unknown error')
        }
      } catch {
        // skip unparseable events
      }
    }
  }

  // If we exit the loop without agent_end, still mark done
  callbacks.onDone()
}
