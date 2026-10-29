import s from "./trilhas.module.css";

/**
 * Aurora sobre a baía: faixas largas e desfocadas seguem as curvas do Caminho
 * Niemeyer e ondulam devagar. Dentro delas, brilhos difusos correm como faróis
 * e lanternas vistos de longe. O MAC fica só sugerido, quase apagado.
 */

const FAIXAS = [
  { d: "M-200 420 C200 300 420 520 760 400 C1080 290 1240 420 1640 330", cor: "#ff9408", largura: 70, classe: "a" },
  { d: "M-200 500 C180 420 460 600 800 500 C1100 410 1260 540 1640 460", cor: "#ca3f16", largura: 80, classe: "b" },
  { d: "M-200 580 C240 520 520 660 860 590 C1140 530 1300 620 1640 560", cor: "#95122c", largura: 95, classe: "c" },
  { d: "M-200 340 C260 260 520 420 820 330 C1120 250 1280 330 1640 270", cor: "#dbe0e1", largura: 40, classe: "d" },
];

const VIAS = [FAIXAS[0].d, FAIXAS[1].d, FAIXAS[2].d];

const MAC = [
  "M800 286 C900 274 1220 274 1320 286",
  "M800 286 C860 352 960 376 1060 376 C1160 376 1260 352 1320 286",
  "M1012 376 C1016 410 1018 440 1020 470",
  "M1108 376 C1104 410 1102 440 1100 470",
];

const LUZES = [
  { via: 0, cor: "#f3f4f5", dur: 9, atraso: 0 },
  { via: 0, cor: "#f3f4f5", dur: 9, atraso: -4.5 },
  { via: 1, cor: "#ff9408", dur: 12, atraso: -2 },
  { via: 1, cor: "#ff9408", dur: 12, atraso: -8 },
  { via: 2, cor: "#ca3f16", dur: 14, atraso: -5 },
];

export function Trilhas() {
  return (
    <div className={s.cena} aria-hidden>
      <svg viewBox="0 0 1440 680" preserveAspectRatio="xMidYMax slice" className={s.svg}>
        <defs>
          <filter id="aurora" x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation="42" />
          </filter>
          <filter id="halo" x="-30%" y="-200%" width="160%" height="500%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <g filter="url(#aurora)" className={s.aurora}>
          {FAIXAS.map((f) => (
            <path key={f.d} d={f.d} fill="none" stroke={f.cor} strokeWidth={f.largura} strokeLinecap="round" className={s[f.classe]} />
          ))}
        </g>

        <g className={s.mac} transform="translate(0 70)">
          {MAC.map((d) => <path key={d} d={d} />)}
        </g>

        <g filter="url(#halo)">
          {LUZES.map((l, i) => (
            <path
              key={i}
              d={VIAS[l.via]}
              pathLength={100}
              stroke={l.cor}
              className={s.luz}
              style={{ animationDuration: `${l.dur}s`, animationDelay: `${l.atraso}s` }}
            />
          ))}
        </g>
      </svg>
      <div className={s.raios} />
      <div className={s.grao} />
    </div>
  );
}
