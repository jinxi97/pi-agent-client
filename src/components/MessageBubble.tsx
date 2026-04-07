import type { Message } from '../types'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

export default function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
          isUser
            ? 'bg-black text-white dark:bg-white dark:text-black'
            : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100'
        }`}
      >
        {message.text}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-neutral-400 dark:bg-white animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  )
}
