export interface ResumoAvaliacoes {
  total: number;
  mediaNota: number | null;
  percentualPositivo: number | null;
}

export const useAvaliacoes = () => {
  const { apiFetch } = useApi();
  const resumo = ref<ResumoAvaliacoes>({
    total: 0,
    mediaNota: null,
    percentualPositivo: null,
  });

  async function fetchResumo() {
    try {
      const data = await apiFetch<ResumoAvaliacoes>("/avaliacoes/resumo");
      resumo.value = data;
    } catch {
      // silencia se ainda não há avaliações
    }
  }

  return { resumo, fetchResumo };
};
