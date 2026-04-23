import { useAuthStore } from "~/stores/auth";
import { PERMISSOES } from "~/types/usuario";

const publicRoutes = new Set([
  "/",
  "/login",
  "/criar-conta",
  "/esqueceu-senha",
  "/redefinir-senha",
]);

// Rotas acessíveis por todos os perfis autenticados (não entram no filtro de permissão)
const rotasLivres = new Set(["/configuracoes/perfil"]);

// Mapa de prefixo de rota → chave de permissão
const ROTAS_PERMISSAO: Array<{ prefixo: string; permissao: string }> = [
  { prefixo: "/dashboard", permissao: "dashboard" },
  { prefixo: "/clientes", permissao: "clientes" },
  { prefixo: "/agenda", permissao: "agendamentos" },
  { prefixo: "/estoque", permissao: "estoque" },
  { prefixo: "/financeiro", permissao: "financeiro" },
  { prefixo: "/relatorios", permissao: "relatorios" },
  { prefixo: "/pdv", permissao: "pdv" },
  { prefixo: "/avaliacoes", permissao: "relatorios" },
  { prefixo: "/fechamento", permissao: "fechamento" },
  { prefixo: "/configuracoes/equipe", permissao: "configuracoes" },
  { prefixo: "/configuracoes", permissao: "configuracoes" },
];

const renovacaoRoutes = new Set([
  "/renovar-assinatura",
  "/renovar-assinatura/sucesso",
  "/renovar-assinatura/falhou",
  "/configuracoes/assinatura",
]);

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();

  if (
    publicRoutes.has(to.path) ||
    to.path.startsWith("/criar-conta") ||
    to.path.startsWith("/avaliar")
  )
    return;

  // Restaura o usuário a partir do cookie de token (após reload/navegação direta)
  await auth.inicializar();

  if (!auth.isAutenticado) {
    return navigateTo("/login");
  }

  // Usuário master (isMaster no JWT) nunca é bloqueado por assinatura
  const isMaster = auth.usuario?.email === "admin@aninpet.com";

  // Bloqueia acesso quando assinatura expirou/cancelou/suspenso
  // Para pendente: bloqueia apenas após o trial expirar
  const trialExpirado = auth.usuario?.trialExpiraEm
    ? new Date(auth.usuario.trialExpiraEm) < new Date()
    : true;

  const bloqueado =
    auth.usuario?.assinaturaStatus === "suspensa" ||
    auth.usuario?.assinaturaStatus === "cancelada" ||
    (auth.usuario?.assinaturaStatus === "pendente" && trialExpirado);

  if (!isMaster && bloqueado && !renovacaoRoutes.has(to.path)) {
    return navigateTo("/configuracoes/assinatura");
  }

  // Bloqueia rotas que o perfil do usuário não tem permissão
  const perfil = auth.usuario?.perfil;
  if (perfil && perfil !== "admin" && !rotasLivres.has(to.path)) {
    const permissoesUsuario = PERMISSOES[perfil] ?? [];
    const rotaRestrita = ROTAS_PERMISSAO.find((r) =>
      to.path.startsWith(r.prefixo),
    );
    if (rotaRestrita && !permissoesUsuario.includes(rotaRestrita.permissao)) {
      const destino = perfil === "caixa" ? "/agenda" : "/dashboard";
      return navigateTo(destino);
    }
  }
});
