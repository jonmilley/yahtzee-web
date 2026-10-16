import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { PIPS } from '../game/pips'

interface Props {
  value: number
  // A new rollId makes the die tumble and land on `value` (unless held)
  rollId: number
  held?: boolean
  disabled?: boolean
  label?: string
  // Set for dice that toggle (hold/release); leave undefined for plain buttons
  pressed?: boolean
  onClick?: () => void
}

// Cube rotation [rotateX, rotateY] that brings each face to the front
const ORIENT: Record<number, [number, number]> = {
  1: [0, 0],
  2: [0, -90],
  3: [-90, 0],
  4: [90, 0],
  5: [0, 90],
  6: [0, 180],
}

// Where each face sits on the cube. Opposite faces add up to 7, like real dice.
const FACES: { value: number; transform: string }[] = [
  { value: 1, transform: 'rotateY(0deg)' },
  { value: 6, transform: 'rotateY(180deg)' },
  { value: 2, transform: 'rotateY(90deg)' },
  { value: 5, transform: 'rotateY(-90deg)' },
  { value: 3, transform: 'rotateX(90deg)' },
  { value: 4, transform: 'rotateX(-90deg)' },
]

const randomSpin = () => (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2))

export default function Die({ value, rollId, held = false, disabled = false, label, pressed, onClick }: Props) {
  const [startX, startY] = ORIENT[value] ?? [0, 0]
  const rotateX = useMotionValue(startX)
  const rotateY = useMotionValue(startY)
  const tilt = useMotionValue(0)
  const bounce = useMotionValue(0)
  const shadowScale = useTransform(bounce, [-90, 0], [0.4, 1])
  const shadowOpacity = useTransform(bounce, [-90, 0], [0.2, 1])

  const lastRoll = useRef<number | null>(null)
  const turns = useRef({ x: 0, y: 0 })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (lastRoll.current === rollId) return
    lastRoll.current = rollId
    if (held) return

    const [faceX, faceY] = ORIENT[value] ?? [0, 0]
    if (reduceMotion) {
      rotateX.set(faceX)
      rotateY.set(faceY)
      return
    }
    const t = turns.current
    t.x += randomSpin()
    t.y += randomSpin()
    const duration = 0.75 + Math.random() * 0.25
    const ease = [0.15, 0.7, 0.25, 1] as const

    // Not stopped on cleanup: re-renders mid-tumble (e.g. holding another die) must not freeze it
    animate(rotateX, t.x * 360 + faceX, { duration, ease })
    animate(rotateY, t.y * 360 + faceY, { duration, ease })
    animate(tilt, (Math.random() - 0.5) * 18, { duration })
    animate(bounce, [-90, 0, -18, 0, -4, 0], {
      duration,
      times: [0, 0.42, 0.6, 0.76, 0.88, 1],
      ease: 'easeOut',
    })
  }, [rollId, held, value, reduceMotion, rotateX, rotateY, tilt, bounce])

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseDown={e => e.preventDefault()}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={label ?? `Die showing ${value}`}
      className="relative block cursor-pointer rounded-[20%] disabled:cursor-default"
      style={{ width: 'var(--die)', height: 'var(--die)' }}
      whileTap={disabled ? undefined : { scale: 0.93 }}
    >
      <motion.div
        className="die-shadow"
        style={{ scale: shadowScale, opacity: shadowOpacity }}
        animate={{ scaleX: held ? 0.8 : 1 }}
      />

      <motion.div
        animate={{ y: held ? -12 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      >
        <motion.div style={{ y: bounce, rotate: tilt }} className="relative">
          <div className="die-scene">
            <motion.div className="die-cube" style={{ rotateX, rotateY }}>
              {FACES.map(f => (
                <div
                  key={`core-${f.value}`}
                  className="die-core"
                  style={{ transform: `${f.transform} translateZ(calc(var(--die) / 2 - 1.5px))` }}
                />
              ))}
              {FACES.map(f => (
                <div
                  key={f.value}
                  className="die-face"
                  style={{ transform: `${f.transform} translateZ(calc(var(--die) / 2))` }}
                >
                  {PIPS[f.value].map(([row, col], i) => (
                    <span
                      key={i}
                      className={f.value === 1 ? 'pip pip-ace' : 'pip'}
                      style={{ gridRow: row, gridColumn: col }}
                    />
                  ))}
                </div>
              ))}
            </motion.div>
          </div>

          {held && (
            <motion.span
              aria-hidden
              initial={{ opacity: 0, scale: 1.25 }}
              animate={{ opacity: 1, scale: 1 }}
              className="pointer-events-none absolute -inset-[7px] rounded-[26%] border-[3px] border-marigold shadow-[0_0_18px_rgb(255_194_61/0.55)]"
            />
          )}
        </motion.div>
      </motion.div>

      {held && (
        <motion.span
          aria-hidden
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-full bg-marigold px-2 py-px text-[11px] font-bold uppercase tracking-wider text-print"
        >
          Held
        </motion.span>
      )}
    </motion.button>
  )
}
