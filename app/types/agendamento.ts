export type StatusAgendamento = "agendado" | "concluido" | "cancelado";

export interface Agendamento {
  id: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  servico: string;
  pet: string;
  dono: string;
  telefone?: string;
  observacoes?: string;
  status: StatusAgendamento;
}
