export type UsuarioPerfil = "admin" | "staff";
export type UsuarioStatus = "ativo" | "inativo";
export type PlanoSistema = "basico" | "plus";
export type PlanoExibido = "basico" | "plus";
export type FormaPagamento = "cartao" | "boleto" | "pix";
export type AssinaturaStatus =
  | "trial"
  | "pendente"
  | "ativa"
  | "suspensa"
  | "cancelada";

// ── Planos SaaS ──────────────────────────────────────────────────────────────

export interface PlanoInfo {
  nome: string;
  preco: number;
  descricao: string;
  modulos: string[];
  destaque?: boolean;
}

export const PLANOS: Record<PlanoSistema, PlanoInfo> = {
  basico: {
    nome: "Básico",
    preco: 79,
    descricao: "Tudo que você precisa para organizar seu petshop.",
    modulos: [
      "dashboard",
      "clientes",
      "pets",
      "agendamentos",
      "servicos",
      "estoque",
      "financeiro",
      "relatorios",
    ],
  },
  plus: {
    nome: "Plus",
    preco: 109,
    descricao:
      "Básico + lembretes automáticos por e-mail para fidelizar seus clientes.",
    modulos: [
      "dashboard",
      "clientes",
      "pets",
      "agendamentos",
      "servicos",
      "estoque",
      "financeiro",
      "relatorios",
      "lembretes",
      "relatorio_mensal",
      "meta_mensal",
    ],
    destaque: true,
  },
};

export const MODULO_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  pets: "Pets",
  agendamentos: "Agendamentos",
  vacinas: "Vacinas",
  estoque: "Estoque",
  financeiro: "Financeiro",
  relatorios: "Relatórios",
  lembretes: "Lembretes automáticos por e-mail",
  relatorio_mensal: "Relatório mensal por e-mail",
  meta_mensal: "Meta mensal",
};

export interface DadosCartao {
  numero: string;
  nome: string;
  validade: string;
  cvv: string;
}

// ── Usuário ──────────────────────────────────────────────────────────────────

export interface Usuario {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone?: string;
  perfil: UsuarioPerfil;
  status: UsuarioStatus;
  tenantId?: string;
  nomePetshop?: string;
  plano?: PlanoSistema;
  assinaturaStatus?: AssinaturaStatus;
  trialExpiraEm?: string;
  metaMensal?: number | null;
  createdAt: string;
  lastAccess?: string;
  avatar?: string;
}

/** Permissões agrupadas por perfil */
export const PERMISSOES: Record<UsuarioPerfil, string[]> = {
  admin: [
    "dashboard",
    "clientes",
    "pets",
    "agendamentos",
    "vacinas",
    "estoque",
    "financeiro",
    "relatorios",
    "usuarios",
    "configuracoes",
  ],
  staff: [
    "dashboard",
    "clientes",
    "pets",
    "agendamentos",
    "vacinas",
    "estoque",
  ],
};

/** Estado do formulário de criação de conta (landing page → dono do negócio) */
export interface CriarContaFormState {
  // Step 1 – Dados da conta
  nomePetshop: string;
  nomeCompleto: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
  // Step 2 – Plano
  plano: PlanoSistema;
  // Step 3 – Pagamento
  formaPagamento: FormaPagamento;
  // Mantido para compatibilidade com StepTipoAcesso (gerenciamento de usuários internos)
  perfil: UsuarioPerfil;
  status: UsuarioStatus;
}
