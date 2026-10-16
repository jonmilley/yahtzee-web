import { useState } from 'react'
import { sounds } from '../sounds/sounds'

export default function MuteButton() {
  const [muted, setMuted] = useState(sounds.isMuted)

  function toggle() {
    sounds.setMuted(!muted)
    setMuted(!muted)
    if (muted) sounds.click()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={muted}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      title={muted ? 'Sound is off' : 'Sound is on'}
      className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-paper/80 transition-colors hover:bg-black/20 hover:text-paper"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        {muted ? (
          <path d="M17 9l5 5M22 9l-5 5" />
        ) : (
          <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
        )}
      </svg>
    </button>
  )
}
