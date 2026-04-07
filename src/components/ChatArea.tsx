import { useState, useRef, useEffect } from 'react'
import type { Message, WorkspaceInfo } from '../types'
import { sendMessage } from '../api'
import MessageBubble from './MessageBubble'

interface ChatAreaProps {
  workspace: WorkspaceInfo
  sessionId: string | null
  messages: Message[]
  onMessagesChange: (messages: Message[]) => void
}

export default function ChatArea({
  workspace,
  sessionId,
  messages,
  onMessagesChange,
}: ChatAreaProps) {
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  useEffect(() => {
    if (!isStreaming) inputRef.current?.focus()
  }, [isStreaming, sessionId])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !sessionId || isStreaming) return

    setInput('')
    setIsStreaming(true)
    setActiveTool(null)

    const userMsg: Message = { role: 'user', text }
    const updated = [...messages, userMsg]
    onMessagesChange(updated)

    const assistantMsg: Message = { role: 'assistant', text: '' }
    let currentMessages = [...updated, assistantMsg]
    onMessagesChange(currentMessages)

    await sendMessage(workspace, sessionId, text, {
      onTextDelta: (delta) => {
        const last = currentMessages[currentMessages.length - 1]
        const newMsg = { ...last, text: last.text + delta }
        currentMessages = [...currentMessages.slice(0, -1), newMsg]
        onMessagesChange(currentMessages)
      },
      onToolStart: (toolName) => setActiveTool(toolName),
      onToolEnd: () => setActiveTool(null),
      onDone: () => {
        setIsStreaming(false)
        setActiveTool(null)
      },
      onError: (error) => {
        const last = currentMessages[currentMessages.length - 1]
        const errorMsg = {
          ...last,
          text: last.text || `Error: ${error}`,
        }
        onMessagesChange([...currentMessages.slice(0, -1), errorMsg])
        setIsStreaming(false)
        setActiveTool(null)
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-neutral-400 dark:text-neutral-500">Select or create a session to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            isStreaming={
              isStreaming &&
              i === messages.length - 1 &&
              msg.role === 'assistant'
            }
          />
        ))}

        {activeTool && (
          <div className="flex justify-start">
            <div className="bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-neutral-400 dark:bg-white rounded-full animate-pulse" />
              Using {activeTool}...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message the agent..."
            disabled={isStreaming}
            rows={1}
            className="flex-1 resize-none bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-600 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-30 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
