export function Sparkline({ dados, cor = "var(--ink)", altura = 36 }: { dados: number[]; cor?: string; altura?: number }) {
  const w = 240, h = altura;
  const max = Math.max(...dados, 1), min = Math.min(...dados, 0);
  const span = max - min || 1;
  const pts = dados.map((v, i) => [(i / Math.max(dados.length - 1, 1)) * w, h - 3 - ((v - min) / span) * (h - 6)]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const last = pts.at(-1);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <path d={`${d} L${w} ${h} L0 ${h} Z`} fill={cor} opacity="0.08" />
      <path d={d} fill="none" stroke={cor} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {last && <circle cx={last[0]} cy={last[1]} r="2.5" fill={cor} />}
    </svg>
  );
}
