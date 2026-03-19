import { useAuthStore } from "~/stores/auth";

const publicRoutes = ["/login", "/criar-conta"];

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();

  if (publicRoutes.includes(to.path)) return;

  if (!auth.isAutenticado) {
    return navigateTo("/login");
  }
});
