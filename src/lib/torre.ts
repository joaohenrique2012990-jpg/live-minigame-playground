export const ALTURA_MAX = 300;
export const VITORIAS_MAX = 20;

export type EstadoTorre = { altura: number; vitorias: number };
export type Acao = { tipo: "altura" | "vitoria"; valor: number };

/** Aplica uma ação. Retorna o novo estado e se houve vitória por altura. */
export function aplicar(e: EstadoTorre, a: Acao): EstadoTorre & { venceu: boolean } {
  if (a.tipo === "vitoria") {
    const vitorias = Math.min(VITORIAS_MAX, Math.max(0, e.vitorias + a.valor));
    return { altura: e.altura, vitorias, venceu: false };
  }
  const altura = Math.max(0, e.altura + a.valor);
  if (altura >= ALTURA_MAX) {
    return { altura: 0, vitorias: Math.min(VITORIAS_MAX, e.vitorias + 1), venceu: true };
  }
  return { altura, vitorias: e.vitorias, venceu: false };
}
