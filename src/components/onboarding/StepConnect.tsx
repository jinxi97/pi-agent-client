import { useState, useEffect } from 'react'
import type { WorkspaceInfo } from '../../types'
import { exposeSyncthing, getSyncthingInfo, pairSyncthing } from '../../api'

interface StepConnectProps {
  workspace: WorkspaceInfo
  onNext: () => void
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-1">
      <label className="text-xs text-neutral-500 dark:text-neutral-400">{label}</label>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white px-3 py-2 rounded-lg break-all select-all">
          {value}
        </code>
        <button
          onClick={handleCopy}
          className="px-3 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shrink-0"
        >
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

export default function StepConnect({ workspace, onNext }: StepConnectProps) {
  const [loading, setLoading] = useState(true)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [syncAddress, setSyncAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [userDeviceId, setUserDeviceId] = useState('')
  const [pairing, setPairing] = useState(false)
  const [paired, setPaired] = useState(false)
  const [pairError, setPairError] = useState<string | null>(null)

  // Expose syncthing and poll for connection info
  useEffect(() => {
    let cancelled = false

    async function setup() {
      try {
        await exposeSyncthing(workspace)

        // Poll until we have both external IP and device ID
        for (let i = 0; i < 60; i++) {
          if (cancelled) return
          const info = await getSyncthingInfo(workspace)
          if (info.externalIp && info.deviceId) {
            if (!cancelled) {
              setDeviceId(info.deviceId)
              setSyncAddress(info.syncAddress)
              setLoading(false)
            }
            return
          }
          await new Promise((r) => setTimeout(r, 3000))
        }
        if (!cancelled) setError('Timed out waiting for syncthing to be ready')
      } catch (err) {
        if (!cancelled) setError((err as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    setup()
    return () => { cancelled = true }
  }, [workspace])

  const handlePair = async () => {
    const trimmed = userDeviceId.trim()
    if (!trimmed) return

    setPairing(true)
    setPairError(null)

    try {
      await pairSyncthing(workspace.podName, workspace.namespace, trimmed)
      setPaired(true)
    } catch (err) {
      setPairError((err as Error).message)
    } finally {
      setPairing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-600 border-t-black dark:border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Setting up file sync...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Connect Syncthing
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Open Syncthing (http://127.0.0.1:8384) and follow these steps:
        </p>
      </div>

      {/* Step A: Add remote device */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-black dark:text-white">
          1. Add Remote Device
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          In Syncthing, click <strong>+ Add Remote Device</strong> and paste these values:
        </p>
        {deviceId && <CopyField label="Device ID" value={deviceId} />}
        {syncAddress && <CopyField label="Address" value={syncAddress} />}
      </div>

      <hr className="border-neutral-200 dark:border-neutral-800" />

      {/* Step B: Share your device ID */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-black dark:text-white">
          2. Share your Device ID
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          In Syncthing, go to <strong>Actions → Show ID</strong> and paste it here:
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={userDeviceId}
            onChange={(e) => setUserDeviceId(e.target.value)}
            placeholder="XXXXXXX-XXXXXXX-XXXXXXX-..."
            disabled={paired}
            className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-600 disabled:opacity-50"
          />
          <button
            onClick={handlePair}
            disabled={!userDeviceId.trim() || pairing || paired}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-30 transition-colors"
          >
            {pairing ? '...' : paired ? 'Paired ✓' : 'Pair'}
          </button>
        </div>
        {pairError && <p className="text-red-500 dark:text-red-400 text-xs">{pairError}</p>}
      </div>

      {paired && (
        <>
          <hr className="border-neutral-200 dark:border-neutral-800" />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-black dark:text-white">
              3. Accept the folder share
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              In your Syncthing UI, accept the <strong>"Default Folder"</strong> share
              from the remote device. Choose a local folder path (e.g. <code>~/workspace</code>).
            </p>
          </div>

          <button
            onClick={onNext}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            I've accepted the folder — Next
          </button>
        </>
      )}
    </div>
  )
}
