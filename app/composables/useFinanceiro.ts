import type {
  Lancamento,
  ResumoMes,
  CreateLancamentoPayload,
} from "~/types/lancamento";

export const useFinanceiro = () => {
  const { apiFetch } = useApi();

  const lancamentos = ref<Lancamento[]>([]);
  const resumo = ref<ResumoMes>({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    total: 0,
  });
  const loading = ref(false);

  const fetchLancamentos = async (params?: {
    dataInicio?: string;
    dataFim?: string;
    tipo?: "Receita" | "Despesa";
  }) => {
    loading.value = true;
    try {
      const query = new URLSearchParams();
      if (params?.dataInicio) query.set("dataInicio", params.dataInicio);
      if (params?.dataFim) query.set("dataFim", params.dataFim);
      if (params?.tipo) query.set("tipo", params.tipo);
      const qs = query.toString();
      lancamentos.value = await apiFetch<Lancamento[]>(
        `/financeiro/lancamentos${qs ? `?${qs}` : ""}`,
      );
    } finally {
      loading.value = false;
    }
  };

  const fetchResumoMes = async (ano?: number, mes?: number) => {
    const now = new Date();
    const a = ano ?? now.getFullYear();
    const m = mes ?? now.getMonth() + 1;
    resumo.value = await apiFetch<ResumoMes>(
      `/financeiro/resumo-mes?ano=${a}&mes=${m}`,
    );
  };

  const criar = async (payload: CreateLancamentoPayload) => {
    const novo = await apiFetch<Lancamento>("/financeiro/lancamentos", {
      method: "POST",
      body: payload,
    });
    lancamentos.value.unshift(novo);
    return novo;
  };

  const remover = async (id: string) => {
    await apiFetch(`/financeiro/lancamentos/${id}`, { method: "DELETE" });
    lancamentos.value = lancamentos.value.filter((l) => l.id !== id);
  };

  return {
    lancamentos,
    resumo,
    loading,
    fetchLancamentos,
    fetchResumoMes,
    criar,
    remover,
  };
};
