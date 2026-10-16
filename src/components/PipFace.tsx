import { PIPS } from '../game/pips'

// Flat die face, printed-ink style, for the score card and small UI spots
export default function PipFace({ value, className = '' }: { value: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 grid-cols-3 grid-rows-3 rounded-[24%] border-[1.5px] border-current p-[2px] ${className}`}
    >
      {PIPS[value]?.map(([row, col], i) => (
        <span
          key={i}
          className="h-[80%] w-[80%] place-self-center rounded-full bg-current"
          style={{ gridRow: row, gridColumn: col }}
        />
      ))}
    </span>
  )
}
