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

  if (publicRoutes.has(to.path) || to.path.startsWith("/criar-conta")) return;

  // Restaura o usuário a partir do cookie de token (após reload/navegação direta)
  await auth.inicializar();

  if (!auth.isAutenticado) {
    return navigateTo("/login");
  }

  // Usuário master (isMaster no JWT) nunca é bloqueado por assinatura
  const isMaster = auth.usuario?.email === "admin@aninpet.com";

  // Usuário com assinatura suspensa ou cancelada só pode acessar páginas de renovação
  if (
    !isMaster &&
    (auth.usuario?.assinaturaStatus === "suspensa" ||
      auth.usuario?.assinaturaStatus === "cancelada") &&
    !renovacaoRoutes.has(to.path)
  ) {
    return navigateTo("/configuracoes/assinatura");
  }
});
