export type UsuarioPerfil = "admin" | "staff";
export type UsuarioStatus = "ativo" | "inativo";

export interface Usuario {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone?: string;
  perfil: UsuarioPerfil;
  status: UsuarioStatus;
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

/** Estado do formulário de criação de conta */
export interface CriarContaFormState {
  nomeCompleto: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
  perfil: UsuarioPerfil;
  status: UsuarioStatus;
}
