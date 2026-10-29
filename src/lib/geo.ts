/**
 * Coordenadas do terminal e arredores. As plataformas são APROXIMADAS —
 * ajustar com o levantamento em campo ou a planta da concessionária.
 */
export const TERMINAL = { lat: -22.8947, lng: -43.1229 };

export const PLATAFORMAS_GEO: Record<string, [number, number]> = {
  A: [-22.89445, -43.12355],
  B: [-22.89462, -43.12318],
  C: [-22.89479, -43.12281],
  D: [-22.89496, -43.12244],
  E: [-22.89513, -43.12207],
};

export const PONTOS = [
  { nome: "Estação das Barcas · Praça Arariboia", tipo: "barcas", pos: [-22.8934, -43.1262] as [number, number] },
  { nome: "Ponto de integração municipal", tipo: "municipal", pos: [-22.8958, -43.1236] as [number, number] },
];

/** Destino aproximado de cada linha de exemplo, para desenhar o trajeto. */
export const DESTINOS: Record<string, [number, number]> = {
  l1: [-22.8186, -43.0045], // Alcântara
  l2: [-22.9050, -43.1090], // Icaraí
  l3: [-22.9325, -43.1030], // Charitas
  l4: [-22.9630, -43.0480], // Itaipu
  l5: [-22.9035, -43.1760], // Centro do Rio
  l6: [-22.7700, -42.9300], // Manilha
};
