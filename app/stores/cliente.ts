import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Cliente, ClienteFormState } from "~/types/cliente";
import type { Pet } from "~/types/pet";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

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
    const { apiFetch } = useApi();
    try {
      const res = await apiFetch<PaginatedResponse<Cliente>>("/clientes", {
        params: { limit: 100 },
      });
      clientes.value = res.data;
    } finally {
      loading.value = false;
    }
  };

  const salvar = async (dados: ClienteFormState): Promise<Cliente> => {
    loading.value = true;
    const { apiFetch } = useApi();
    try {
      const { pets: petsData, ...clienteData } = dados;

      // 1. Criar o cliente
      const novoCliente = await apiFetch<Cliente>("/clientes", {
        method: "POST",
        body: {
          ...clienteData,
          cpf: clienteData.cpf.replaceAll(/\D/g, ""),
        },
      });

      // 2. Criar cada pet vinculado ao cliente recém-criado
      const pets = await Promise.all(
        petsData.map((pet) =>
          apiFetch<Pet>("/pets", {
            method: "POST",
            body: {
              clienteId: novoCliente.id,
              nome: pet.nome,
              especie: pet.especie ?? "Outro",
              raca: pet.raca || undefined,
              sexo: pet.sexo || undefined,
              porte: pet.tamanho,
              peso: pet.peso || undefined,
              observacoes: pet.observacoes || undefined,
            },
          }),
        ),
      );

      const clienteCompleto: Cliente = { ...novoCliente, pets };
      clientes.value.unshift(clienteCompleto);
      return clienteCompleto;
    } finally {
      loading.value = false;
    }
  };

  const atualizar = async (
    id: string,
    dados: Partial<Omit<ClienteFormState, "pets">>,
  ): Promise<void> => {
    loading.value = true;
    const { apiFetch } = useApi();
    try {
      const atualizado = await apiFetch<Cliente>(`/clientes/${id}`, {
        method: "PATCH",
        body: dados,
      });
      const idx = clientes.value.findIndex((c) => c.id === id);
      if (idx !== -1) clientes.value[idx] = atualizado;
    } finally {
      loading.value = false;
    }
  };

  const remover = async (id: string): Promise<void> => {
    loading.value = true;
    const { apiFetch } = useApi();
    try {
      await apiFetch(`/clientes/${id}`, { method: "DELETE" });
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
