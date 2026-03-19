export type CategoriaEstoque =
  | "racao"
  | "higiene"
  | "medicamento"
  | "acessorio"
  | "outros";

export type TipoMovimentacao = "entrada" | "saida";

export interface Produto {
  id: string;
  nome: string;
  categoria: CategoriaEstoque;
  unidade: string; // "kg", "un.", "ml", "cx"
  quantidadeAtual: number;
  quantidadeMinima: number;
  precoCusto: number;
  precoVenda?: number;
  descricao?: string;
  ativo: boolean;
}

export interface Movimentacao {
  id: string;
  produtoId: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  data: string; // YYYY-MM-DD
  motivo?: string;
}
