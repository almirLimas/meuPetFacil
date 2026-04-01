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
]);

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();

  if (publicRoutes.has(to.path) || to.path.startsWith("/criar-conta")) return;

  // Restaura o usuário a partir do cookie de token (após reload/navegação direta)
  await auth.inicializar();

  if (!auth.isAutenticado) {
    return navigateTo("/login");
  }

  // Usuário com assinatura suspensa só pode acessar páginas de renovação
  if (
    auth.usuario?.assinaturaStatus === "suspensa" &&
    !renovacaoRoutes.has(to.path)
  ) {
    return navigateTo("/renovar-assinatura");
  }
});
