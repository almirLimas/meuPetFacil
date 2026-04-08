export type StatusAgendamento =
  | "Agendado"
  | "Confirmado"
  | "EmAtendimento"
  | "Concluido"
  | "Cancelado"
  | "NaoCompareceu";

export type ModalidadeAgendamento = "ClienteTraz" | "PetshopBusca";

export interface Agendamento {
  id: string;
  dataHora: string; // ISO 8601
  status: StatusAgendamento;
  modalidade: ModalidadeAgendamento;
  taxaBusca?: number | null;
  observacoes?: string | null;
  clienteId: string;
  petId: string;
  cliente: { id: string; nome: string; telefonePrincipal: string };
  pet: { id: string; nome: string; especie?: string };
  servicos: Array<{
    servico: {
      id: string;
      nome: string;
      preco: number;
      duracaoMinutos?: number;
    };
  }>;
}

export interface CreateAgendamentoPayload {
  clienteId: string;
  petId: string;
  servicoIds: string[];
  dataHora: string;
  modalidade: ModalidadeAgendamento;
  taxaBusca?: number;
  observacoes?: string;
}
