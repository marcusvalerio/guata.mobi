import type { Papel } from "./types";

/**
 * Sessão de demonstração por cookie. No banco real, isso vira Supabase Auth
 * com o papel guardado no perfil do usuário e checado também via RLS.
 */
export const COOKIE = "guata_papel";

export const NOME_PAPEL: Record<Papel, string> = {
  central: "Admin Central",
  admin: "Admin do Terminal",
  gestor: "Gestor",
  operador: "Operador",
};

/** Quem pode entrar em cada área. */
export const ACESSO: Record<string, Papel[]> = {
  "/central": ["central"],
  "/admin": ["central", "admin"],
  "/painel": ["central", "admin", "gestor"],
  "/operador": ["central", "admin", "gestor", "operador"],
};

export const INICIO: Record<Papel, string> = {
  central: "/central",
  admin: "/admin",
  gestor: "/painel",
  operador: "/operador",
};

export function papelValido(v: string | undefined): v is Papel {
  return v === "central" || v === "admin" || v === "gestor" || v === "operador";
}
