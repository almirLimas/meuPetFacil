export type UsuarioPerfil =
  | "admin"
  | "gerente"
  | "atendente"
  | "caixa"
  | "staff";

export const PERFIL_LABELS: Record<UsuarioPerfil, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  atendente: "Atendente",
  caixa: "Caixa",
  staff: "Staff",
};

export const PERFIS_STAFF: Exclude<UsuarioPerfil, "admin" | "staff">[] = [
  "gerente",
  "atendente",
  "caixa",
];
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
    descricao: "Para petshops que querem se organizar e crescer.",
    modulos: [
      "ia_anin",
      "agendamentos",
      "clientes",
      "servicos",
      "pdv",
      "financeiro",
      "relatorios",
    ],
  },
  plus: {
    nome: "Plus",
    preco: 109,
    descricao:
      "Para petshops que querem fidelizar clientes no piloto automático.",
    modulos: [
      "ia_anin",
      "agendamentos",
      "clientes",
      "servicos",
      "pdv_completo",
      "financeiro",
      "lembretes",
      "avaliacao_cliente",
      "relatorio_mensal",
      "meta_mensal",
    ],
    destaque: true,
  },
};

export const MODULO_LABELS: Record<string, string> = {
  ia_anin: "IA Anin incluída",
  dashboard: "Dashboard",
  clientes: "Clientes e pets",
  pets: "Pets",
  agendamentos: "Agenda de agendamentos",
  servicos: "Controle de serviços",
  pdv: "PDV com leitor de código de barras",
  pdv_completo: "PDV com múltiplas formas de pagamento",
  vacinas: "Vacinas",
  estoque: "Estoque",
  financeiro: "Financeiro",
  relatorios: "Relatórios essenciais",
  lembretes: "Lembretes automáticos por e-mail",
  relatorio_mensal: "Relatório mensal por e-mail",
  meta_mensal: "Meta mensal com acompanhamento",
  avaliacao_cliente: "Avaliação automática após atendimento",
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
  taxaBusca?: number | null;
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
  gerente: [
    "dashboard",
    "clientes",
    "pets",
    "agendamentos",
    "vacinas",
    "estoque",
    "relatorios",
  ],
  atendente: ["dashboard", "clientes", "pets", "agendamentos", "vacinas"],
  caixa: ["agendamentos", "pdv"],
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
