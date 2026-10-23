const TICKS = Array.from({ length: 72 }, (_, index) => index);

export default function Instrument({ children }) {
  return (
    <div className="relative grid h-56 w-56 place-items-center sm:h-64 sm:w-64 lg:h-72 lg:w-72">
      <div className="animate-spin-reverse pointer-events-none absolute inset-[7%] rounded-full" aria-hidden="true">
        <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-copper shadow-[0_0_14px_var(--copper)]" />
      </div>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-ink animate-spin-slow" aria-hidden="true">
        <circle cx="100" cy="100" r="74" fill="none" stroke="currentColor" strokeOpacity="0.16" />
        {TICKS.map((tick) => {
          const angle = (tick / TICKS.length) * Math.PI * 2;
          const inner = tick % 6 === 0 ? 78 : 84;
          return (
            <line
              key={tick}
              x1={100 + Math.cos(angle) * inner}
              y1={100 + Math.sin(angle) * inner}
              x2={100 + Math.cos(angle) * 93}
              y2={100 + Math.sin(angle) * 93}
              stroke="currentColor"
              strokeOpacity={tick % 6 === 0 ? 0.72 : 0.28}
              strokeWidth={tick % 6 === 0 ? 1.5 : 0.8}
            />
          );
        })}
      </svg>
      <div className="relative z-10 text-center">{children}</div>
    </div>
  );
}
