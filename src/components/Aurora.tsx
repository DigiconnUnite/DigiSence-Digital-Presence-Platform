import { useState, useEffect } from 'react';

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
}

export default function Aurora(props: AuroraProps) {
  const [hue, setHue] = useState(0);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setHue(prev => (prev + 0.5) % 360);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const from = `hsl(${hue}, 90%, 85%)`;
  const to = 'transparent';

  return (
    <div className="relative opacity-90 h-screen">
      <div className="absolute inset-0">
        <div className="relative h-[50vh] w-full">
          <div
            className="absolute bottom-0 right-0 z-[-2] h-full w-full"
            style={{
              background: `linear-gradient(to bottom, ${from}, ${to})`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}