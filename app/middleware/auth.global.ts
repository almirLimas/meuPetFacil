import { useAuthStore } from "~/stores/auth";

const publicRoutes = new Set([
  "/",
  "/login",
  "/criar-conta",
  "/esqueceu-senha",
  "/redefinir-senha",
]);

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
});
