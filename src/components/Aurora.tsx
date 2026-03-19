import './Aurora.css';

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
}

export default function Aurora(props: AuroraProps) {
  return (
    <div className="relative opacity-90 h-screen aurora-container">
      <div className="absolute inset-0">
        <div className="relative h-[50vh] w-full">
          <div
            className="absolute bottom-0 right-0 z-[-2] h-full w-full aurora-gradient"
          ></div>
        </div>
      </div>
    </div>
  );
}
