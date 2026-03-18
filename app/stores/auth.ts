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
      // TODO: integrar com API de autenticação
      console.log("Login:", { email, senha });
      // Simulação — remover quando integrar API
      token.value = "mock-token";
      usuario.value = {
        id: "1",
        nomeCompleto: "Administrador",
        email,
        perfil: "admin",
        status: "ativo",
        createdAt: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
      };
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
      // TODO: integrar com API de registro — senha deve ser hasheada no backend
      console.log("Registro de usuário:", { ...dados, senha: "[REDACTED]" });
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
