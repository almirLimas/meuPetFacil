import type {
  Venda,
  CreateVendaPayload,
  ResumoDia,
  ListaVendasResponse,
} from "~/types/pdv";

export const usePdv = () => {
  const { apiFetch } = useApi();

  const vendas = ref<Venda[]>([]);
  const total = ref(0);
  const resumo = ref<ResumoDia | null>(null);
  const loading = ref(false);

  const fecharVenda = async (payload: CreateVendaPayload): Promise<Venda> => {
    return apiFetch<Venda>("/pdv/vendas", {
      method: "POST",
      body: payload,
    });
  };

  const fetchVendas = async (params?: {
    dataInicio?: string;
    dataFim?: string;
    page?: number;
  }) => {
    loading.value = true;
    try {
      const query = new URLSearchParams();
      if (params?.dataInicio) query.set("dataInicio", params.dataInicio);
      if (params?.dataFim) query.set("dataFim", params.dataFim);
      if (params?.page) query.set("page", String(params.page));
      const qs = query.toString();
      const res = await apiFetch<ListaVendasResponse>(
        `/pdv/vendas${qs ? `?${qs}` : ""}`,
      );
      vendas.value = res.vendas;
      total.value = res.total;
      return res;
    } finally {
      loading.value = false;
    }
  };

  const fetchResumoDia = async (data?: string) => {
    const qs = data ? `?data=${data}` : "";
    resumo.value = await apiFetch<ResumoDia>(`/pdv/resumo-dia${qs}`);
    return resumo.value;
  };

  const cancelarVenda = async (id: string) => {
    const atualizada = await apiFetch<Venda>(`/pdv/vendas/${id}/cancelar`, {
      method: "PATCH",
    });
    const idx = vendas.value.findIndex((v) => v.id === id);
    if (idx !== -1) vendas.value[idx] = atualizada;
    return atualizada;
  };

  return {
    vendas,
    total,
    resumo,
    loading,
    fecharVenda,
    fetchVendas,
    fetchResumoDia,
    cancelarVenda,
  };
};
