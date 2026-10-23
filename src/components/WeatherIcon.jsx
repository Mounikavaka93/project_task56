import { sceneFromCode } from '../utils/weather';

function Sun() {
  const rays = Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2;
    return {
      x1: 32 + Math.cos(angle) * 16,
      y1: 32 + Math.sin(angle) * 16,
      x2: 32 + Math.cos(angle) * 23,
      y2: 32 + Math.sin(angle) * 23,
    };
  });

  return (
    <g className="wx-spin" stroke="currentColor" fill="currentColor">
      <circle cx="32" cy="32" r="9" stroke="none" />
      {rays.map((ray) => (
        <line key={`${ray.x1}-${ray.y1}`} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} strokeWidth="1.8" strokeLinecap="round" />
      ))}
    </g>
  );
}

function Moon() {
  return <path d="M40 14a14 14 0 1 0 0 30 11 11 0 1 1 0-30Z" fill="currentColor" stroke="none" />;
}

function Cloud({ y = 36 }) {
  return (
    <g className="wx-float" fill="currentColor" stroke="none">
      <ellipse cx="32" cy={y} rx="14" ry="8" />
      <ellipse cx="22" cy={y + 2} rx="9" ry="7" />
      <ellipse cx="43" cy={y + 3} rx="8" ry="6.5" />
      <ellipse cx="30" cy={y - 7} rx="8" ry="7" />
    </g>
  );
}

function Rain({ heavy = false }) {
  const drops = heavy ? [18, 28, 38, 48] : [24, 34, 44];
  return (
    <g stroke="currentColor" fill="none" strokeWidth="1.7" strokeLinecap="round">
      {drops.map((x, index) => (
        <line
          key={x}
          x1={x}
          y1="46"
          x2={x - 2}
          y2={heavy ? 58 : 54}
          className="wx-drip"
          style={{ animationDelay: `${index * 0.16}s` }}
        />
      ))}
    </g>
  );
}

function Snow() {
  return (
    <g fill="currentColor" stroke="none">
      {[22, 32, 44].map((x, index) => (
        <circle key={x} cx={x} cy="52" r="1.8" className="wx-fall" style={{ animationDelay: `${index * 0.28}s` }} />
      ))}
    </g>
  );
}

function Bolt() {
  return <path d="M36 30 27 42h7l-4 14 15-18h-8l4-8Z" fill="currentColor" stroke="none" className="wx-flash" />;
}

function Fog() {
  return (
    <>
      <ellipse cx="32" cy="26" rx="14" ry="7" fill="currentColor" opacity="0.28" stroke="none" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="38" x2="52" y2="38" className="wx-float" />
        <line x1="18" y1="46" x2="46" y2="46" className="wx-float" style={{ animationDelay: '.35s' }} />
        <line x1="24" y1="54" x2="40" y2="54" className="wx-float" style={{ animationDelay: '.7s' }} />
      </g>
    </>
  );
}

export default function WeatherIcon({ code, isDay = true, className = 'h-10 w-10' }) {
  const scene = sceneFromCode(code);
  const night = !isDay;

  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" aria-hidden="true">
      {scene === 'clear' && (night ? <Moon /> : <Sun />)}
      {scene === 'partly' && (
        <>
          <g transform="translate(16 -10) scale(0.58)">{night ? <Moon /> : <Sun />}</g>
          <Cloud y={40} />
        </>
      )}
      {scene === 'cloudy' && <Cloud y={34} />}
      {scene === 'fog' && <Fog />}
      {scene === 'drizzle' && (
        <>
          <Cloud y={30} />
          <Rain />
        </>
      )}
      {scene === 'rain' && (
        <>
          <Cloud y={30} />
          <Rain heavy />
        </>
      )}
      {scene === 'snow' && (
        <>
          <Cloud y={30} />
          <Snow />
        </>
      )}
      {scene === 'thunder' && (
        <>
          <Cloud y={28} />
          <Bolt />
        </>
      )}
    </svg>
  );
}
