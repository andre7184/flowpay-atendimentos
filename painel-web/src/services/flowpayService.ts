// src/services/flowpayService.ts
import api from "./api";
import type { ResumoDashboard, Atendimento } from "../types";

export const flowpayService = {
  getResumo: () => api.get<ResumoDashboard>("/dashboard"),
  getAtendimentos: () => api.get<Atendimento[]>("/atendimentos"),

  // NOVA ROTA: Busca a lista completa de atendentes (ativos e inativos)
  getAtendentes: () => api.get("/atendentes"),

  criarAtendente: (dados: { nome: string; timeAtendimento: string }) =>
    api.post("/atendentes", dados),

  excluirAtendente: (id: number) => api.delete(`/atendentes/${id}`),

  // NOVA ROTA: Alternar Ativo/Inativo
  alternarStatusAtendente: (id: number) =>
    api.patch(`/atendentes/${id}/status`),

  criarAtendimento: (dados: { assunto: string; time: string }) =>
    api.post("/atendimentos", dados),

  encerrarAtendimento: (id: number) =>
    api.post(`/atendimentos/${id}/finalizar`),
};
