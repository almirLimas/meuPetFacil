export type CategoriaEstoque =
  | "Medicamento"
  | "Alimento"
  | "Acessorio"
  | "Higiene"
  | "Vacina"
  | "Outro";

export type TipoMovimentacao = "Entrada" | "Saida";

export interface Produto {
  id: string;
  nome: string;
  categoria: CategoriaEstoque;
  unidade?: string;
  codigoBarras?: string;
  quantidadeAtual: number;
  estoqueMinimo: number;
  precoCompra: number;
  precoVenda?: number;
  descricao?: string;
  ativo: boolean;
}

export interface Movimentacao {
  id: string;
  produtoId: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  precoUnitario?: number;
  motivo?: string;
  observacoes?: string;
  createdAt: string;
  produto?: { id: string; nome: string; unidade?: string };
}

export interface CreateProdutoPayload {
  nome: string;
  categoria: CategoriaEstoque;
  unidade?: string;
  codigoBarras?: string;
  quantidadeAtual: number;
  estoqueMinimo: number;
  precoCompra: number;
  precoVenda?: number;
  descricao?: string;
  ativo?: boolean;
}

export interface CreateMovimentacaoPayload {
  produtoId: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  precoUnitario?: number;
  motivo?: string;
  observacoes?: string;
}
