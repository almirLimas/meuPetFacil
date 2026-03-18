import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Cliente, ClienteFormState } from "~/types/cliente";

export const useClienteStore = defineStore("cliente", () => {
  // -- State ----------------------------------------------------------------
  const clientes = ref<Cliente[]>([]);
  const loading = ref(false);

  // -- Getters --------------------------------------------------------------
  const total = computed(() => clientes.value.length);

  const ativos = computed(() =>
    clientes.value.filter((c) => c.status === "Ativo"),
  );

  const buscarPorId = (id: string) =>
    clientes.value.find((c) => c.id === id) ?? null;

  // -- Actions --------------------------------------------------------------
  const listar = async () => {
    loading.value = true;
    try {
      // TODO: integrar com API
      console.log("Listar clientes");
    } finally {
      loading.value = false;
    }
  };

  const salvar = async (dados: ClienteFormState): Promise<Cliente> => {
    loading.value = true;
    try {
      // TODO: integrar com API
      const novo: Cliente = {
        ...dados,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      clientes.value.push(novo);
      console.log("Cliente salvo:", novo);
      return novo;
    } finally {
      loading.value = false;
    }
  };

  const atualizar = async (
    id: string,
    dados: Partial<ClienteFormState>,
  ): Promise<void> => {
    loading.value = true;
    try {
      // TODO: integrar com API
      const idx = clientes.value.findIndex((c) => c.id === id);
      const atual = clientes.value[idx];
      if (idx !== -1 && atual) {
        // Remove chaves indefinidas para não sobrescrever campos obrigatórios
        const patch = Object.fromEntries(
          Object.entries(dados).filter(([, v]) => v !== undefined),
        ) as Partial<ClienteFormState>;
        clientes.value[idx] = {
          ...atual,
          ...patch,
          id: atual.id,
          createdAt: atual.createdAt,
          updatedAt: new Date().toISOString(),
        };
      }
    } finally {
      loading.value = false;
    }
  };

  const remover = async (id: string): Promise<void> => {
    loading.value = true;
    try {
      // TODO: integrar com API
      clientes.value = clientes.value.filter((c) => c.id !== id);
    } finally {
      loading.value = false;
    }
  };

  return {
    // state
    clientes,
    loading,
    // getters
    total,
    ativos,
    buscarPorId,
    // actions
    listar,
    salvar,
    atualizar,
    remover,
  };
});
