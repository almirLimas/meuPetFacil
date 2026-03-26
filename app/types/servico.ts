export type PorteServico = "Pequeno" | "Medio" | "Grande" | "Todos";
export type CategoriaServico =
  | "Banho"
  | "Tosa"
  | "Consulta"
  | "Vacina"
  | "Internacao"
  | "Cirurgia"
  | "Exame"
  | "Outro";

export interface Servico {
  id: string;
  nome: string;
  categoria: CategoriaServico;
  porte?: PorteServico;
  duracaoMinutos?: number;
  preco: number;
  descricao?: string;
  ativo: boolean;
}
