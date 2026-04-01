import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Cliente, ClienteFormState } from "~/types/cliente";

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

  // Inicializa o apiFetch no nível do setup para garantir contexto Nuxt válido
  const { apiFetch } = useApi();

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
    try {
      const { pets: petsData, ...clienteData } = dados;

      const novoCliente = await apiFetch<Cliente>("/clientes", {
        method: "POST",
        body: {
          ...clienteData,
          cpf: clienteData.cpf.replaceAll(/\D/g, ""),
          pets: petsData.map((pet) => ({
            nome: pet.nome,
            especie: pet.especie ?? "Outro",
            raca: pet.raca || undefined,
            sexo: pet.sexo || undefined,
            porte: pet.tamanho,
            dataNascimento: pet.dataNascimento || undefined,
            peso: pet.peso || undefined,
            observacoes: pet.observacoes || undefined,
          })),
        },
      });

      clientes.value.unshift(novoCliente);
      return novoCliente;
    } finally {
      loading.value = false;
    }
  };

  const buscarUm = async (id: string): Promise<Cliente> => {
    const cliente = await apiFetch<Cliente>(`/clientes/${id}`);
    const idx = clientes.value.findIndex((c) => c.id === id);
    if (idx !== -1) clientes.value[idx] = cliente;
    else clientes.value.unshift(cliente);
    return cliente;
  };

  const atualizar = async (
    id: string,
    dados: Partial<Omit<ClienteFormState, "pets">>,
  ): Promise<void> => {
    loading.value = true;
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
    buscarUm,
    salvar,
    atualizar,
    remover,
  };
});
