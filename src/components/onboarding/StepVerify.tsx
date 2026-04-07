import { useState } from 'react'

interface StepVerifyProps {
  onNext: () => void
}

function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs font-mono hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
    >
      {value}
      <span className="text-[10px] text-neutral-400">{copied ? '✓' : '⎘'}</span>
    </button>
  )
}

export default function StepVerify({ onNext }: StepVerifyProps) {
  const [folderAdded, setFolderAdded] = useState(false)
  const [deviceReady, setDeviceReady] = useState(false)
  const [folderReady, setFolderReady] = useState(false)

  const allReady = folderAdded && deviceReady && folderReady

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Add Folder & Verify Sync
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Add the shared folder in Syncthing, then confirm everything is syncing:
        </p>
      </div>

      {/* Add folder instructions */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
        <p className="text-sm font-medium text-black dark:text-white">
          Add the workspace folder
        </p>
        <ol className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
          <li className="flex gap-2">
            <span className="text-neutral-400 shrink-0">1.</span>
            In Syncthing, click <strong>+ Add Folder</strong>
          </li>
          <li className="flex gap-2">
            <span className="text-neutral-400 shrink-0">2.</span>
            <span>Set <strong>Folder Label</strong> to <CopyValue value="Workspace" /></span>
          </li>
          <li className="flex gap-2">
            <span className="text-neutral-400 shrink-0">3.</span>
            <span>Set <strong>Folder ID</strong> to <CopyValue value="default" /></span>
          </li>
          <li className="flex gap-2">
            <span className="text-neutral-400 shrink-0">4.</span>
            <span>Set <strong>Folder Path</strong> to <CopyValue value="~/workspace" /></span>
          </li>
          <li className="flex gap-2">
            <span className="text-neutral-400 shrink-0">5.</span>
            Go to the <strong>Sharing</strong> tab and check the remote device
          </li>
          <li className="flex gap-2">
            <span className="text-neutral-400 shrink-0">6.</span>
            Click <strong>Save</strong>
          </li>
        </ol>
      </div>

      {/* Verification checklist */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
          <input
            type="checkbox"
            checked={folderAdded}
            onChange={(e) => setFolderAdded(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-black dark:accent-white"
          />
          <div>
            <p className="text-sm font-medium text-black dark:text-white">
              Folder added
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              I've added the folder with the settings above and saved.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
          <input
            type="checkbox"
            checked={deviceReady}
            onChange={(e) => setDeviceReady(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-black dark:accent-white"
          />
          <div>
            <p className="text-sm font-medium text-black dark:text-white">
              Remote Device is "Up to Date"
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Under <strong>Remote Devices</strong>, the device shows a green
              "Up to Date" status.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
          <input
            type="checkbox"
            checked={folderReady}
            onChange={(e) => setFolderReady(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-black dark:accent-white"
          />
          <div>
            <p className="text-sm font-medium text-black dark:text-white">
              Folder is "Up to Date"
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Under <strong>Folders</strong>, the "Workspace" folder shows
              "Up to Date".
            </p>
          </div>
        </label>
      </div>

      <button
        onClick={onNext}
        disabled={!allReady}
        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-30 transition-colors"
      >
        Everything is syncing — Next
      </button>
    </div>
  )
}
