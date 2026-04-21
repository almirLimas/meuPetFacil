export type StatusOrdemServico = "Aberta" | "Concluida" | "Cancelada";
export type FormaPagamento = "Dinheiro" | "Cartao" | "Pix" | "Fiado" | "Outro";
export type TipoItemOs = "Produto" | "Servico";

export interface ItemOrdemServico {
  id: string;
  tipo: TipoItemOs;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  produtoId?: string | null;
  servicoId?: string | null;
  produto?: { id: string; nome: string; unidade?: string } | null;
}

export interface OrdemServico {
  id: string;
  numero: number;
  agendamentoId: string;
  status: StatusOrdemServico;
  observacoes?: string | null;
  formaPagamento?: FormaPagamento | null;
  desconto?: number | null;
  createdAt: string;
  updatedAt: string;
  agendamento: {
    id: string;
    dataHora: string;
    taxaBusca?: number | null;
    modalidade: string;
    cliente: { id: string; nome: string; telefonePrincipal: string };
    pet: { id: string; nome: string; especie?: string; raca?: string };
    servicos: Array<{
      servico: { id: string; nome: string; preco: number };
    }>;
  };
  itens: ItemOrdemServico[];
}

export interface AddItemOsPayload {
  tipo: TipoItemOs;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  produtoId?: string;
  servicoId?: string;
}

export interface FinalizarOsPayload {
  formaPagamento?: FormaPagamento;
  desconto?: number;
  observacoes?: string;
}
