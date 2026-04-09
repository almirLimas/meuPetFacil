export type FormaPagamento = "Dinheiro" | "Cartao" | "Pix" | "Outro";
export type StatusVenda = "Concluida" | "Cancelada";
export type TipoItemVenda = "Produto" | "Servico";

export interface ItemVenda {
  id: string;
  tipo: TipoItemVenda;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  produtoId?: string;
  servicoId?: string;
}

export interface Venda {
  id: string;
  numero: number;
  status: StatusVenda;
  formaPagamento: FormaPagamento;
  valorTotal: number;
  desconto?: number;
  valorPago?: number;
  troco?: number;
  observacoes?: string;
  clienteId?: string;
  cliente?: { id: string; nome: string } | null;
  itens: ItemVenda[];
  createdAt: string;
}

export interface ItemVendaPayload {
  tipo: TipoItemVenda;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  produtoId?: string;
  servicoId?: string;
}

export interface CreateVendaPayload {
  formaPagamento: FormaPagamento;
  itens: ItemVendaPayload[];
  desconto?: number;
  valorPago?: number;
  clienteId?: string;
  observacoes?: string;
}

export interface ResumoDia {
  totalVendas: number;
  quantidadeVendas: number;
  porFormaPagamento: Record<string, number>;
  data: string;
}

export interface ListaVendasResponse {
  vendas: Venda[];
  total: number;
  page: number;
  take: number;
}
