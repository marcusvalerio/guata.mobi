import s from "./trilhas.module.css";

/**
 * Longa exposição noturna: faróis e lanternas dos ônibus riscam as curvas do
 * Caminho Niemeyer até o MAC. Cada via usa pathLength=100, então o traço e o
 * percurso da luz são proporcionais em qualquer curva.
 */

// Vias que atravessam a cena, como avenidas em curva.
const VIAS = [
  "M-40 600 C260 600 380 520 620 520 C860 520 980 590 1480 560",
  "M-40 628 C300 628 420 548 640 548 C900 548 1000 618 1480 590",
  "M-40 572 C240 572 360 492 600 492 C820 492 960 560 1480 530",
  "M1480 470 C1180 470 1100 410 900 410 C640 410 520 470 -40 450",
];

// MAC: borda do prato, fundo do prato, haste e espelho d'água.
const MAC = [
  "M800 286 C900 274 1220 274 1320 286",
  "M800 286 C860 352 960 376 1060 376 C1160 376 1260 352 1320 286",
  "M1012 376 C1016 410 1018 440 1020 470",
  "M1108 376 C1104 410 1102 440 1100 470",
  "M740 470 L1380 470",
];

// Rampa sinuosa que sobe até o prato.
const RAMPA = "M180 470 C330 470 380 420 520 420 C660 420 700 470 820 470 C900 470 930 430 960 400 C975 386 990 372 1004 362";

type Luz = { via: number; cor: "farol" | "lanterna" | "vinho"; dur: number; atraso: number; reverso?: boolean };
const LUZES: Luz[] = [
  { via: 0, cor: "farol", dur: 5.5, atraso: 0 },
  { via: 0, cor: "farol", dur: 5.5, atraso: -2.6 },
  { via: 1, cor: "lanterna", dur: 7, atraso: -1 },
  { via: 1, cor: "lanterna", dur: 7, atraso: -4.2 },
  { via: 2, cor: "farol", dur: 6.2, atraso: -3.4 },
  { via: 2, cor: "vinho", dur: 9, atraso: -6 },
  { via: 3, cor: "lanterna", dur: 8, atraso: -2 },
  { via: 3, cor: "vinho", dur: 8, atraso: -5.5 },
];

export function Trilhas() {
  return (
    <div className={s.cena} aria-hidden>
      <svg viewBox="0 0 1440 680" preserveAspectRatio="xMidYMax slice" className={s.svg}>
        <defs>
          <filter id="brilho" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="agua" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff9408" stopOpacity="0" />
            <stop offset=".04" stopColor="#ff9408" stopOpacity=".07" />
            <stop offset="1" stopColor="#ff9408" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Reflexo na baía */}
        <rect x="0" y="471" width="1440" height="209" fill="url(#agua)" className={s.reflexo} />

        {/* Traçado do MAC desenhado à mão, em sequência */}
        {MAC.map((d, i) => (
          <path key={d} d={d} pathLength={1} className={s.desenho} style={{ animationDelay: `${0.4 + i * 0.35}s` }} />
        ))}
        <path d={RAMPA} pathLength={1} className={`${s.desenho} ${s.rampaBase}`} style={{ animationDelay: "2.2s" }} />

        {/* Vias apagadas */}
        {VIAS.map((d) => <path key={d} d={d} className={s.via} />)}

        {/* Luzes em movimento */}
        <g filter="url(#brilho)">
          {LUZES.map((l, i) => (
            <path
              key={i}
              d={VIAS[l.via]}
              pathLength={100}
              className={`${s.luz} ${s[l.cor]}`}
              style={{ animationDuration: `${l.dur}s`, animationDelay: `${l.atraso}s` }}
            />
          ))}
          {/* Quem caminha pela rampa */}
          <path d={RAMPA} pathLength={100} className={`${s.luz} ${s.subida}`} />
          <path d={RAMPA} pathLength={100} className={`${s.luz} ${s.subida}`} style={{ animationDelay: "-3s" }} />
        </g>
      </svg>
    </div>
  );
}
