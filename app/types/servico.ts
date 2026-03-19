export type PorteServico = "pequeno" | "medio" | "grande" | "todos";
export type CategoriaServico =
  | "higiene"
  | "estetica"
  | "saude"
  | "hospedagem"
  | "outros";

export interface Servico {
  id: string;
  nome: string;
  categoria: CategoriaServico;
  porte: PorteServico;
  duracaoMin: number; // em minutos
  preco: number;
  descricao?: string;
  ativo: boolean;
}
