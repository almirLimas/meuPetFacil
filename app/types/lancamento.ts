export type TipoLancamento = "Receita" | "Despesa";

export type CategoriaLancamento =
  | "Servico"
  | "Produto"
  | "Consulta"
  | "Material"
  | "Manutencao"
  | "Outro";

export interface Lancamento {
  id: string;
  tipo: TipoLancamento;
  valor: number;
  descricao: string;
  categoria: CategoriaLancamento;
  data: string;
  agendamentoId?: string;
  agendamento?: {
    id: string;
    pet: { nome: string };
    servicos: Array<{ servico: { nome: string } }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ResumoMes {
  receitas: number;
  despesas: number;
  saldo: number;
  total: number;
}

export interface CreateLancamentoPayload {
  tipo: TipoLancamento;
  valor: number;
  descricao: string;
  categoria?: CategoriaLancamento;
  data?: string;
  agendamentoId?: string;
}
