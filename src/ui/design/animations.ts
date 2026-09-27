/**
 * Named animations, each built from the motion tokens so reduced motion stops
 * them too. Used as `animate-<name>`.
 */

export interface Animation {
  name: string;
  /** The `animation` shorthand, without the keyframes name. */
  timing: string;
  keyframes: string;
}

export const ANIMATIONS = [
  { name: "fade-in", timing: "var(--duration-moderate) var(--ease-emphasized) both", keyframes: "from { opacity: 0 } to { opacity: 1 }" },
  { name: "rise-in", timing: "var(--duration-moderate) var(--ease-emphasized) both", keyframes: "from { opacity: 0; transform: translateY(0.5rem) } to { opacity: 1; transform: none }" },
  { name: "scale-in", timing: "var(--duration-quick) var(--ease-emphasized) both", keyframes: "from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: none }" },
  // Loading indicators run for as long as the wait, and stop under reduced motion like everything else.
  { name: "spin", timing: "calc(var(--duration-moderate) * 3) linear infinite", keyframes: "to { transform: rotate(1turn) }" },
  { name: "shimmer", timing: "calc(var(--duration-moderate) * 5) ease-in-out infinite", keyframes: "0%, 100% { opacity: 1 } 50% { opacity: 0.55 }" },
] as const satisfies readonly Animation[];
