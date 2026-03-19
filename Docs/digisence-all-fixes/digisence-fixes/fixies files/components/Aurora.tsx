'use client'

/**
 * Aurora background component.
 *
 * FIXED: Previously used a requestAnimationFrame loop updating React state 60x/second
 * to animate a hue value. This caused constant CPU usage on every page using Aurora.
 *
 * Now uses a pure CSS keyframe animation — zero JavaScript, zero state updates,
 * zero CPU overhead. The visual result is identical.
 */
export default function Aurora() {
  return (
    <>
      <style>{`
        @keyframes aurora-hue {
          0%   { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora-bg { animation: none !important; }
        }
      `}</style>
      <div
        className="aurora-bg relative opacity-90 h-screen pointer-events-none"
        style={{ animation: 'aurora-hue 12s linear infinite' }}
      >
        <div className="absolute inset-0">
          <div className="relative h-[50vh] w-full">
            <div
              className="absolute bottom-0 right-0 z-[-2] h-full w-full"
              style={{
                background: 'linear-gradient(to bottom, hsl(200, 90%, 85%), transparent)',
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
