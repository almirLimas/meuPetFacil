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

export interface PlanoCategoria {
  nome: string;
  itens: Array<{ label: string; futuro?: boolean }>;
}

export interface PlanoInfo {
  nome: string;
  preco: number;
  descricao: string;
  modulos: string[];
  categorias?: PlanoCategoria[];
  destaque?: boolean;
}

export const PLANOS: Record<PlanoSistema, PlanoInfo> = {
  basico: {
    nome: "Básico",
    preco: 49.9,
    descricao: "Para petshops que querem organizar a rotina.",
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
    descricao: "Para petshops que vendem produtos e querem controle total.",
    modulos: [
      "ia_anin",
      "agendamentos",
      "clientes",
      "servicos",
      "pdv_completo",
      "financeiro",
      "estoque",
      "lembretes",
      "avaliacao_cliente",
      "relatorio_mensal",
      "meta_mensal",
    ],
    categorias: [
      {
        nome: "Agenda",
        itens: [
          { label: "Agendamentos com status" },
          { label: "Histórico de atendimentos" },
        ],
      },
      {
        nome: "Clientes & Pets",
        itens: [
          { label: "Cadastro de clientes" },
          { label: "Cadastro de pets" },
        ],
      },
      {
        nome: "Serviços",
        itens: [
          { label: "Cadastro de serviços" },
          { label: "Cadastro de pacotes de serviços", futuro: true },
          { label: "Controle de uso de itens dos pacotes", futuro: true },
        ],
      },
      {
        nome: "Estoque",
        itens: [
          { label: "Cadastro de produtos" },
          { label: "Movimentação do estoque" },
          { label: "Alerta de estoque mínimo", futuro: true },
          { label: "Alerta de vencimento", futuro: true },
          { label: "Análise de estoque – Curva ABC", futuro: true },
          { label: "Sugestão de compra", futuro: true },
          {
            label: "Importação de produtos via XML do fornecedor",
            futuro: true,
          },
          { label: "Impressão de etiquetas", futuro: true },
        ],
      },
      {
        nome: "Vendas",
        itens: [
          { label: "Tela de frente de caixa (PDV)" },
          { label: "Venda de produtos, serviços e pacotes", futuro: true },
          { label: "Orçamentos", futuro: true },
          { label: "Controle de caixa / fechamento" },
        ],
      },
      {
        nome: "Financeiro",
        itens: [
          { label: "Contas a pagar" },
          { label: "Contas a receber" },
          { label: "Controle de saldos e débitos dos clientes" },
          { label: "Meta mensal com acompanhamento" },
          { label: "Relatório mensal por e-mail" },
        ],
      },
      {
        nome: "Geral",
        itens: [
          { label: "IA Anin incluída" },
          { label: "Usuários ilimitados com controle por perfil de acesso" },
        ],
      },
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
  estoque: "Controle de estoque",
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
// Módulos disponíveis por plano
export const MODULOS_PLANO: Record<PlanoSistema, string[]> = {
  basico: [
    "dashboard",
    "clientes",
    "agendamentos",
    "servicos",
    "pdv",
    "financeiro",
    "relatorios",
    "fechamento",
    "configuracoes",
  ],
  plus: [
    "dashboard",
    "clientes",
    "agendamentos",
    "servicos",
    "pdv",
    "financeiro",
    "relatorios",
    "fechamento",
    "configuracoes",
    "estoque",
    "avaliacao_cliente",
  ],
};

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
    "pdv",
    "fechamento",
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
  caixa: ["agendamentos", "pdv", "clientes"],
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
