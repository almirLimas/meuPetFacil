export type StatusAgendamento =
  | "Agendado"
  | "Confirmado"
  | "EmAtendimento"
  | "Concluido"
  | "Cancelado";

export type ModalidadeAgendamento = "ClienteTraz" | "PetshopBusca";

export interface Agendamento {
  id: string;
  dataHora: string; // ISO 8601
  status: StatusAgendamento;
  modalidade: ModalidadeAgendamento;
  observacoes?: string | null;
  clienteId: string;
  petId: string;
  servicoId: string;
  cliente: { id: string; nome: string; telefonePrincipal: string };
  pet: { id: string; nome: string; especie?: string };
  servico: { id: string; nome: string; preco: number; duracaoMinutos?: number };
}

export interface CreateAgendamentoPayload {
  clienteId: string;
  petId: string;
  servicoId: string;
  dataHora: string;
  modalidade: ModalidadeAgendamento;
  observacoes?: string;
}
