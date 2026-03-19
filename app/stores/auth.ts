import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Usuario, UsuarioPerfil } from "~/types/usuario";
import { PERMISSOES } from "~/types/usuario";

export const useAuthStore = defineStore("auth", () => {
  // -- State ----------------------------------------------------------------
  const usuario = ref<Usuario | null>(null);
  const token = ref<string | null>(null);
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
    } finally {
      loading.value = false;
    }
  };

  const registrar = async (dados: {
    nomeCompleto: string;
    email: string;
    telefone?: string;
    senha: string;
    perfil: UsuarioPerfil;
  }) => {
    loading.value = true;
    try {
      const config = useRuntimeConfig();
      await $fetch(`${config.public.apiUrl}/auth/registrar`, {
        method: "POST",
        body: dados,
      });
      navigateTo("/login");
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    usuario.value = null;
    token.value = null;
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
    login,
    registrar,
    logout,
    atualizarUltimoAcesso,
  };
});