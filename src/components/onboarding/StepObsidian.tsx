interface StepObsidianProps {
  onDone: () => void
}

export default function StepObsidian({ onDone }: StepObsidianProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Open in Obsidian
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          One last step — open your synced folder as an Obsidian vault:
        </p>
      </div>

      <ol className="space-y-4">
        <li className="flex gap-3">
          <span className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
            1
          </span>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Open <strong>Obsidian</strong>
          </p>
        </li>
        <li className="flex gap-3">
          <span className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
            2
          </span>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Click <strong>"Open folder as vault"</strong>
          </p>
        </li>
        <li className="flex gap-3">
          <span className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
            3
          </span>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Select the folder you chose in Syncthing
            (e.g. <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">~/workspace</code>)
          </p>
        </li>
        <li className="flex gap-3">
          <span className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
            4
          </span>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Your agent's wiki pages will appear in the sidebar. Any pages the
            agent creates will sync here automatically.
          </p>
        </li>
      </ol>

      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Edits you make in Obsidian will also sync back to the agent's
          workspace in near real-time.
        </p>
      </div>

      <button
        onClick={onDone}
        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
      >
        Done — Start chatting
      </button>
    </div>
  )
}
