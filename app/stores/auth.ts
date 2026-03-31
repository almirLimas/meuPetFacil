import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Usuario, UsuarioPerfil, PlanoSistema } from "~/types/usuario";
import { PERMISSOES } from "~/types/usuario";

export const useAuthStore = defineStore("auth", () => {
  // -- State ----------------------------------------------------------------
  // Token persistido em cookie (sobrevive a reloads e é SSR-safe)
  const token = useCookie<string | null>("auth_token", {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    sameSite: "lax",
  });
  const usuario = ref<Usuario | null>(null);
  const loading = ref(false);

  // -- Getters --------------------------------------------------------------
  const isAutenticado = computed(() => !!token.value && !!usuario.value);
  const perfil = computed<UsuarioPerfil | null>(
    () => usuario.value?.perfil ?? null,
  );
  const isAdmin = computed(() => usuario.value?.perfil === "admin");
  const permissoes = computed(() =>
    usuario.value ? PERMISSOES[usuario.value.perfil] : [],
  );

  const temPermissao = (modulo: string): boolean => {
    return usuario.value
      ? PERMISSOES[usuario.value.perfil].includes(modulo)
      : false;
  };

  // -- Actions --------------------------------------------------------------
  // Carrega o usuário a partir do token persistido (chamado no middleware)
  const inicializar = async () => {
    if (!token.value || usuario.value) return;
    try {
      const config = useRuntimeConfig();
      const res = await $fetch<Usuario>(`${config.public.apiUrl}/auth/perfil`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      usuario.value = res;
    } catch {
      // Token expirado ou inválido — limpa o cookie
      token.value = null;
    }
  };

  const login = async (email: string, senha: string) => {
    loading.value = true;
    try {
      const config = useRuntimeConfig();
      const res = await $fetch<{ access_token: string; usuario: Usuario }>(
        `${config.public.apiUrl}/auth/login`,
        { method: "POST", body: { email, senha } },
      );
      token.value = res.access_token;
      usuario.value = { ...res.usuario, lastAccess: new Date().toISOString() };
      navigateTo("/dashboard");
    } catch (err: unknown) {
      const { show } = useApiError();
      const data = (err as { data?: { message?: string | string[] } })?.data;
      const msg = Array.isArray(data?.message)
        ? data.message.join(", ")
        : (data?.message ?? "Falha ao realizar login. Tente novamente.");
      show(msg);
    } finally {
      loading.value = false;
    }
  };

  const registrar = async (dados: {
    nomePetshop: string;
    nomeCompleto: string;
    email: string;
    telefone?: string;
    senha: string;
    plano: PlanoSistema;
  }) => {
    loading.value = true;
    try {
      const config = useRuntimeConfig();
      const res = await $fetch<{
        access_token: string;
        id: string;
        nomeCompleto: string;
        email: string;
        perfil: UsuarioPerfil;
        tenantId: string;
        nomePetshop: string;
        plano: PlanoSistema;
      }>(`${config.public.apiUrl}/auth/registrar`, {
        method: "POST",
        body: { ...dados, perfil: "admin" },
      });
      token.value = res.access_token;
      usuario.value = {
        id: res.id,
        nomeCompleto: res.nomeCompleto,
        email: res.email,
        perfil: res.perfil,
        status: "ativo",
        tenantId: res.tenantId,
        nomePetshop: res.nomePetshop,
        plano: res.plano,
        createdAt: new Date().toISOString(),
      };
      return res;
    } catch (err: unknown) {
      const { show } = useApiError();
      const data = (err as { data?: { message?: string | string[] } })?.data;
      const msg = Array.isArray(data?.message)
        ? data.message.join(", ")
        : (data?.message ?? "Falha ao criar conta. Tente novamente.");
      show(msg);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    usuario.value = null;
    token.value = null; // limpa o cookie também
    navigateTo("/login");
  };

  const atualizarUltimoAcesso = () => {
    if (usuario.value) {
      usuario.value.lastAccess = new Date().toISOString();
    }
  };

  return {
    // state
    usuario,
    token,
    loading,
    // getters
    isAutenticado,
    perfil,
    isAdmin,
    permissoes,
    temPermissao,
    // actions
    inicializar,
    login,
    registrar,
    logout,
    atualizarUltimoAcesso,
  };
});
