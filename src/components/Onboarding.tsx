import { useState } from 'react'
import type { WorkspaceInfo } from '../types'
import StepWelcome from './onboarding/StepWelcome'
import StepConnect from './onboarding/StepConnect'
import StepVerify from './onboarding/StepVerify'
import StepObsidian from './onboarding/StepObsidian'

interface OnboardingProps {
  workspace: WorkspaceInfo
  onComplete: () => void
}

const STEPS = ['Welcome', 'Connect', 'Verify', 'Obsidian'] as const

export default function Onboarding({ workspace, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)

  const handleDone = () => {
    localStorage.setItem('pi_agent_onboarding_complete', 'true')
    onComplete()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? 'w-8 bg-black dark:bg-white'
                  : i < step
                    ? 'w-4 bg-neutral-400 dark:bg-neutral-500'
                    : 'w-4 bg-neutral-200 dark:bg-neutral-800'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        {step === 0 && <StepWelcome onNext={() => setStep(1)} />}
        {step === 1 && <StepConnect workspace={workspace} onNext={() => setStep(2)} />}
        {step === 2 && <StepVerify onNext={() => setStep(3)} />}
        {step === 3 && <StepObsidian onDone={handleDone} />}

        {/* Footer */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            Step {step + 1} of {STEPS.length}
          </p>
          <button
            onClick={handleDone}
            className="text-xs text-neutral-400 dark:text-neutral-600 hover:text-black dark:hover:text-white transition-colors"
          >
            Skip setup
          </button>
        </div>
      </div>
    </div>
  )
}
