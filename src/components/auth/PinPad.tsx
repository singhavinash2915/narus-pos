import { useState } from 'react'
import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PinPadProps {
  onSubmit: (pin: string) => void
  isLoading?: boolean
  error?: string
}

export function PinPad({ onSubmit, isLoading, error }: PinPadProps) {
  const [pin, setPin] = useState('')

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit
      setPin(newPin)
      if (newPin.length >= 4) {
        // Auto-submit at 4 digits
        onSubmit(newPin)
      }
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
  }

  const handleClear = () => {
    setPin('')
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  return (
    <div className="flex flex-col items-center gap-6">
      {/* PIN Display */}
      <div className="flex gap-3">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all",
              i < pin.length
                ? "bg-brand-500 border-brand-500 scale-110"
                : "border-neutral-300"
            )}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive animate-shake">{error}</p>
      )}

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-3">
        {digits.map((digit, i) => {
          if (digit === '') return <div key={i} />
          if (digit === 'del') {
            return (
              <button
                key={i}
                onClick={handleDelete}
                onDoubleClick={handleClear}
                disabled={isLoading}
                className="w-[72px] h-[72px] sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 active:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Delete className="w-6 h-6" />
              </button>
            )
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(digit)}
              disabled={isLoading}
              className="w-[72px] h-[72px] sm:w-16 sm:h-16 rounded-2xl text-2xl font-medium text-neutral-800 hover:bg-neutral-100 active:bg-brand-50 active:text-brand-600 transition-colors cursor-pointer disabled:opacity-50 select-none"
            >
              {digit}
            </button>
          )
        })}
      </div>
    </div>
  )
}
