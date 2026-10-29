/** Marca: duas paradas ligadas por um trecho, como num mapa de linhas. "Guatá" é caminhar, em tupi. */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-ui)", fontWeight: 600, letterSpacing: "-0.02em" }}>
      <svg width={size * 1.6} height={size} viewBox="0 0 32 20" aria-hidden>
        <path d="M5 15 L13 15 Q16 15 17.5 12 L19.5 8 Q21 5 24 5 L27 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="5" cy="15" r="3.4" fill="var(--signal)" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="27" cy="5" r="3.4" fill="var(--paper)" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <span style={{ fontSize: size * 0.82 }}>guatá<span style={{ color: "var(--muted)", fontWeight: 400 }}>.mobi</span></span>
    </span>
  );
}
