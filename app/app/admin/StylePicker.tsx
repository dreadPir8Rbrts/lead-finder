'use client'

import { STYLE_OPTIONS } from '@/lib/themes'

export default function StylePicker({ value, onChange }: { value: string; onChange: (style: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-600">Style</span>
      <div role="radiogroup" aria-label="Demo site style" className="flex gap-2">
        {STYLE_OPTIONS.map(opt => {
          const selected = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-2 border rounded px-3 py-1.5 text-sm transition-colors ${
                selected
                  ? 'border-blue-600 ring-2 ring-blue-500 text-gray-900 bg-blue-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex">
                {opt.swatches.map(color => (
                  <span
                    key={color}
                    className="w-3 h-3 rounded-full border border-black/10 -ml-1 first:ml-0"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
