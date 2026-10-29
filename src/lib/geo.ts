/**
 * Referências do OpenStreetMap: parada "Terminal João Goulart" (Av. Visconde do
 * Rio Branco), prédio do terminal e terminal das barcas da Praça Araribóia. As plataformas A–E são
 * APROXIMADAS — ajustar com a planta da concessionária ou levantamento em campo.
 */
/** Ponto oficial da camada Terminais_mobilidade (SIGeo). */
export const TERMINAL = { lat: -22.891228, lng: -43.125424 };

export const PLATAFORMAS_GEO: Record<string, [number, number]> = {
  A: [-22.89039, -43.12636],
  B: [-22.89039, -43.12582],
  C: [-22.89039, -43.12529],
  D: [-22.89039, -43.12476],
  E: [-22.89039, -43.12422],
};

export const PONTOS = [
  { nome: "Estação das Barcas · Praça Araribóia", tipo: "barcas", pos: [-22.89422, -43.12497] as [number, number] },
  { nome: "Praça Araribóia", tipo: "municipal", pos: [-22.89396, -43.12406] as [number, number] },
];
