import type { Servico } from "~/types/servico";

export const useServicos = () => {
  const { apiFetch } = useApi();
  const servicos = useState<Servico[]>("servicos", () => []);
  const loading = ref(false);

  const fetchAll = async (apenasAtivos = false) => {
    loading.value = true;
    try {
      const params = apenasAtivos ? "?ativos=true" : "";
      servicos.value = await apiFetch<Servico[]>(`/servicos${params}`);
    } finally {
      loading.value = false;
    }
  };

  const create = async (payload: Omit<Partial<Servico>, "id" | "ativo">) => {
    const novo = await apiFetch<Servico>("/servicos", {
      method: "POST",
      body: payload,
    });
    servicos.value.push(novo);
    return novo;
  };

  const update = async (id: string, payload: Partial<Servico>) => {
    const updated = await apiFetch<Servico>(`/servicos/${id}`, {
      method: "PATCH",
      body: payload,
    });
    const idx = servicos.value.findIndex((s) => s.id === id);
    if (idx !== -1) servicos.value[idx] = updated;
    return updated;
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    return update(id, { ativo });
  };

  const remove = async (id: string) => {
    await apiFetch(`/servicos/${id}`, { method: "DELETE" });
    servicos.value = servicos.value.filter((s) => s.id !== id);
  };

  return { servicos, loading, fetchAll, create, update, toggleAtivo, remove };
};
