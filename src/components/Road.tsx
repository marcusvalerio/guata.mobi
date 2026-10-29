import s from "./road.module.css";

/**
 * Vista de cima de uma via com três faixas. Os ônibus andam em velocidades
 * diferentes — a faixa de baixo "congestiona" e para no semáforo.
 */
export function Road() {
  return (
    <div className={s.road} aria-hidden>
      <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice" className={s.svg}>
        <rect width="1200" height="300" fill="var(--asphalt)" />
        <line x1="0" y1="4" x2="1200" y2="4" stroke="var(--signal)" strokeWidth="3" />
        <line x1="0" y1="296" x2="1200" y2="296" stroke="var(--signal)" strokeWidth="3" />
        <line x1="0" y1="100" x2="1200" y2="100" className={s.lane} />
        <line x1="0" y1="200" x2="1200" y2="200" className={s.lane} />

        {/* Faixa de pedestres */}
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={860} y={14 + i * 31.5} width={46} height={18} fill="#e9e4d6" opacity="0.85" />
        ))}

        <g className={`${s.bus} ${s.fast}`}><Bus y={30} label="110" /></g>
        <g className={`${s.bus} ${s.mid}`}><Bus y={130} label="38" /></g>
        <g className={`${s.bus} ${s.mid2}`}><Bus y={130} label="47" /></g>
        <g className={`${s.bus} ${s.jam}`}><Bus y={230} label="425" /></g>
        <g className={`${s.bus} ${s.jam2}`}><Bus y={230} label="39" /></g>
      </svg>
      <div className={s.light}>
        <span className={s.r} /><span className={s.y} /><span className={s.g} />
      </div>
    </div>
  );
}

function Bus({ y, label }: { y: number; label: string }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <rect width="150" height="42" rx="5" fill="#f3f0e8" />
      <rect x="126" y="5" width="18" height="32" rx="2" fill="#2a2924" />
      {[14, 40, 66, 92].map((x) => <rect key={x} x={x} y="6" width="20" height="5" rx="1" fill="#2a2924" opacity=".7" />)}
      {[14, 40, 66, 92].map((x) => <rect key={x} x={x} y="31" width="20" height="5" rx="1" fill="#2a2924" opacity=".7" />)}
      <rect x="0" y="16" width="44" height="10" rx="1" fill="var(--signal)" />
      <text x="6" y="24.5" fontSize="9" fontFamily="var(--font-mono)" fill="#3d2f00" fontWeight="600">{label}</text>
    </g>
  );
}
