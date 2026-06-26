// src/types/index.ts

export interface Atendente {
  id: number;
  nome: string;
  timeAtendimento: string;
  atendimentosAtivos: number;
}

export interface Atendimento {
  id: number;
  assunto: string;
  timeDesignado: string;
  status: string;
  criadoEm?: string;
  iniciadoEm?: string;
  finalizadoEm?: string;
  atendente?: Atendente;
}

export interface ResumoDashboard {
  totalAtendentes: number;
  totalAtendimentos: number;
  filas: { CARTOES: number; EMPRESTIMOS: number; OUTROS: number };
  atendentes: Atendente[];
  historico: Atendimento[];
}
