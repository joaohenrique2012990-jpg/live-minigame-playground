import { describe, it, expect } from "vitest";
import { aplicar } from "./torre";

describe("regras da torre", () => {
  it("altura nunca fica abaixo de 0", () => {
    expect(aplicar({ altura: 10, vitorias: 0 }, { tipo: "altura", valor: -150 }).altura).toBe(0);
  });
  it("chegar em 300 soma 1 vitória e zera a torre", () => {
    expect(aplicar({ altura: 290, vitorias: 3 }, { tipo: "altura", valor: 15 })).toEqual({ altura: 0, vitorias: 4, venceu: true });
  });
  it("Dar/Roubar Vitória mudam só as vitórias", () => {
    expect(aplicar({ altura: 50, vitorias: 2 }, { tipo: "vitoria", valor: 1 })).toEqual({ altura: 50, vitorias: 3, venceu: false });
    expect(aplicar({ altura: 50, vitorias: 0 }, { tipo: "vitoria", valor: -1 }).vitorias).toBe(0);
  });
  it("vitórias param em 20", () => {
    expect(aplicar({ altura: 0, vitorias: 20 }, { tipo: "vitoria", valor: 1 }).vitorias).toBe(20);
  });
});
