interface StepWelcomeProps {
  onNext: () => void
}

export default function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Welcome to your Knowledge Base
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
          Your agent writes wiki pages to a shared workspace. To view and edit
          them on your desktop, you'll need two apps:
        </p>
      </div>

      <div className="space-y-3">
        <a
          href="https://syncthing.net/downloads/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg">
            🔄
          </div>
          <div className="flex-1">
            <p className="font-medium text-black dark:text-white text-sm">Syncthing</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Keeps your local folder in sync with the agent's workspace
            </p>
          </div>
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        <a
          href="https://obsidian.md/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg">
            📝
          </div>
          <div className="flex-1">
            <p className="font-medium text-black dark:text-white text-sm">Obsidian</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              View and edit the agent's wiki pages as a local vault
            </p>
          </div>
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
      >
        I've installed both — Next
      </button>
    </div>
  )
}
