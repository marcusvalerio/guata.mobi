/**
 * Símbolo Guatá: o MAC de Niterói desmontado em três traços — o prato, a haste
 * e a rampa que leva até ele. A rampa, em laranja, é o "caminhar" do nome (tupi).
 */
export function Marca({ size = 28, fundo = false }: { size?: number; fundo?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden style={{ flex: "none" }}>
      {fundo && <rect width="48" height="48" rx="12" fill="var(--ink)" />}
      <g fill="none" strokeWidth="3.6" stroke={fundo ? "var(--paper)" : "currentColor"}>
        {/* Prato */}
        <path d="M5 12.5 C9.5 12.5 12 20.5 24 20.5 C36 20.5 38.5 12.5 43 12.5" />
        {/* Haste */}
        <path d="M15.5 25.5 C18 25.5 19.5 28.5 24 28.5 C28.5 28.5 30 25.5 32.5 25.5" />
      </g>
      {/* Rampa */}
      <path d="M7 38 C11.5 38 13 33.5 19 33.5 C25.5 33.5 26 39.5 33 39.5 C37.5 39.5 39.5 36 41.5 36" fill="none" stroke="var(--signal)" strokeWidth="3.6" />
    </svg>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.4, fontFamily: "var(--font-ui)", fontWeight: 600, letterSpacing: "-0.03em" }}>
      <Marca size={size * 1.35} />
      <span style={{ fontSize: size * 0.9 }}>guatá<span style={{ color: "var(--muted)", fontWeight: 400 }}>.mobi</span></span>
    </span>
  );
}
