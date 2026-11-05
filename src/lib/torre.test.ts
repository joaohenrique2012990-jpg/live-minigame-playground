import { describe, it, expect } from "vitest";
import { aplicar, ALTURA_MAX, VITORIAS_MAX, type EstadoTorre } from "./torre";

describe("regras da torre", () => {
  it("incrementa altura corretamente", () => {
    const estado: EstadoTorre = { altura: 0, vitorias: 0 };
    const r1 = aplicar(estado, { tipo: "altura", valor: 1 });
    expect(r1).toEqual({ altura: 1, vitorias: 0, venceu: false });

    const r2 = aplicar(r1, { tipo: "altura", valor: 40 });
    expect(r2).toEqual({ altura: 41, vitorias: 0, venceu: false });
  });

  it("altura nunca fica abaixo de 0 com valores negativos", () => {
    expect(aplicar({ altura: 10, vitorias: 0 }, { tipo: "altura", valor: -150 }).altura).toBe(0);
    expect(aplicar({ altura: 0, vitorias: 2 }, { tipo: "altura", valor: -5 }).altura).toBe(0);
    expect(aplicar({ altura: 20, vitorias: 1 }, { tipo: "altura", valor: -40 }).altura).toBe(0);
  });

  it("chegar exatamente em 300 soma 1 vitória e zera a torre", () => {
    const res = aplicar({ altura: 260, vitorias: 2 }, { tipo: "altura", valor: 40 });
    expect(res).toEqual({ altura: 0, vitorias: 3, venceu: true });
  });

  it("ultrapassar 300 soma 1 vitória e zera a torre", () => {
    const res = aplicar({ altura: 200, vitorias: 5 }, { tipo: "altura", valor: 150 });
    expect(res).toEqual({ altura: 0, vitorias: 6, venceu: true });
  });

  it("Dar Vitória muda apenas as vitórias e mantém a altura", () => {
    const res = aplicar({ altura: 120, vitorias: 3 }, { tipo: "vitoria", valor: 1 });
    expect(res).toEqual({ altura: 120, vitorias: 4, venceu: false });
  });

  it("Roubar Vitória subtrai vitória sem alterar a altura", () => {
    const res = aplicar({ altura: 120, vitorias: 3 }, { tipo: "vitoria", valor: -1 });
    expect(res).toEqual({ altura: 120, vitorias: 2, venceu: false });
  });

  it("Roubar Vitória com 0 vitórias mantém em 0", () => {
    const res = aplicar({ altura: 75, vitorias: 0 }, { tipo: "vitoria", valor: -1 });
    expect(res).toEqual({ altura: 75, vitorias: 0, venceu: false });
  });

  it("vitórias são limitadas ao máximo de 20", () => {
    const res = aplicar({ altura: 10, vitorias: 20 }, { tipo: "vitoria", valor: 1 });
    expect(res.vitorias).toBe(VITORIAS_MAX);

    const resPorAltura = aplicar({ altura: 299, vitorias: 20 }, { tipo: "altura", valor: 5 });
    expect(resPorAltura.vitorias).toBe(VITORIAS_MAX);
    expect(resPorAltura.altura).toBe(0);
    expect(resPorAltura.venceu).toBe(true);
  });
});
