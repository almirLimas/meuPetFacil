export interface PacoteServico {
  id: string;
  nome: string;
  descricao?: string | null;
  valor: number;
  totalSessoes: number;
  validadeDias: number;
  ativo: boolean;
  tenantId: string;
  servicos?: Array<{ id: string; nome: string; categoria: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface PacoteClienteAtivo {
  id: string;
  pacoteId: string;
  clienteId: string;
  petId?: string | null;
  tenantId: string;
  sessoesUsadas: number;
  totalSessoes: number;
  valor: number;
  status: "Ativo" | "Expirado" | "Cancelado";
  inicioEm: string;
  expiraEm: string;
  aviso3dEnviadoEm?: string | null;
  createdAt: string;
  updatedAt: string;
  pacote?: {
    nome: string;
    servicos?: Array<{ id: string; nome: string }> | null;
  };
  cliente?: { nome: string; telefonePrincipal?: string | null };
  pet?: { nome: string } | null;
}
