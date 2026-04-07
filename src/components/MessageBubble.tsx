import { useState } from 'react'
import Markdown from 'react-markdown'
import type { Message } from '../types'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

function ToolMessage({ message }: { message: Message }) {
  const [expanded, setExpanded] = useState(false)
  const isDone = message.text === 'done'
  const hasResult = !!message.toolResult

  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 text-xs px-3 py-1.5 rounded-lg cursor-pointer"
        onClick={() => hasResult && setExpanded((v) => !v)}
      >
        {!isDone ? (
          <span className="w-2 h-2 bg-neutral-400 dark:bg-white rounded-full animate-pulse" />
        ) : message.toolIsError ? (
          <span className="text-red-500">✕</span>
        ) : (
          <span className="text-green-600 dark:text-green-400">✓</span>
        )}
        {message.toolName || 'tool'}
        {hasResult && (
          <svg
            className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
      {expanded && message.toolResult && (
        <div className="mt-1 ml-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2 max-h-48 overflow-y-auto">
          <pre className="whitespace-pre-wrap break-all text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
            {message.toolResult}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (message.role === 'tool') {
    return <ToolMessage message={message} />
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? 'bg-black text-white dark:bg-white dark:text-black whitespace-pre-wrap'
            : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100'
        }`}
      >
        {isUser ? (
          message.text
        ) : (
          <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none
            [&_p]:my-1.5
            [&_ul]:my-1.5 [&_ol]:my-1.5
            [&_li]:my-0.5
            [&_pre]:my-2 [&_pre]:bg-neutral-200 [&_pre]:dark:bg-neutral-800 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto
            [&_code]:text-xs [&_code]:bg-neutral-200 [&_code]:dark:bg-neutral-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
            [&_pre_code]:bg-transparent [&_pre_code]:p-0
            [&_h1]:text-base [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1.5
            [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1.5
            [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
            [&_a]:underline
            [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:dark:border-neutral-600 [&_blockquote]:pl-3 [&_blockquote]:italic
            [&_hr]:my-3
          ">
            <Markdown>{message.text}</Markdown>
          </div>
        )}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-neutral-400 dark:bg-white animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  )
}
