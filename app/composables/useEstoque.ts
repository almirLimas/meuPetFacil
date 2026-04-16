import type {
  Produto,
  Movimentacao,
  CreateProdutoPayload,
  CreateMovimentacaoPayload,
} from "~/types/estoque";

export const useEstoque = () => {
  const { apiFetch } = useApi();

  const produtos = useState<Produto[]>("estoque-produtos", () => []);
  const movimentacoes = ref<Movimentacao[]>([]);
  const loading = ref(false);

  const fetchProdutos = async (busca?: string, alertas = false) => {
    loading.value = true;
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      if (alertas) params.set("alertas", "true");
      const query = params.toString();
      produtos.value = await apiFetch<Produto[]>(
        `/estoque/produtos${query ? `?${query}` : ""}`,
      );
    } finally {
      loading.value = false;
    }
  };

  const fetchMovimentacoes = async (produtoId?: string) => {
    const query = produtoId ? `?produtoId=${produtoId}` : "";
    movimentacoes.value = await apiFetch<Movimentacao[]>(
      `/estoque/movimentacoes${query}`,
    );
  };

  const createProduto = async (payload: CreateProdutoPayload) => {
    const novo = await apiFetch<Produto>("/estoque/produtos", {
      method: "POST",
      body: payload,
    });
    produtos.value.push(novo);
    return novo;
  };

  const updateProduto = async (
    id: string,
    payload: Partial<CreateProdutoPayload>,
  ) => {
    const atualizado = await apiFetch<Produto>(`/estoque/produtos/${id}`, {
      method: "PATCH",
      body: payload,
    });
    const idx = produtos.value.findIndex((p) => p.id === id);
    if (idx !== -1) produtos.value[idx] = atualizado;
    return atualizado;
  };

  const removeProduto = async (id: string) => {
    await apiFetch(`/estoque/produtos/${id}`, { method: "DELETE" });
    produtos.value = produtos.value.filter((p) => p.id !== id);
  };

  const createMovimentacao = async (payload: CreateMovimentacaoPayload) => {
    const mov = await apiFetch<Movimentacao>("/estoque/movimentacoes", {
      method: "POST",
      body: payload,
    });
    const p = produtos.value.find((p) => p.id === payload.produtoId);
    if (p) {
      p.quantidadeAtual =
        payload.tipo === "Entrada"
          ? p.quantidadeAtual + payload.quantidade
          : p.quantidadeAtual - payload.quantidade;
    }
    movimentacoes.value.unshift(mov);
    return mov;
  };

  return {
    produtos,
    movimentacoes,
    loading,
    fetchProdutos,
    fetchMovimentacoes,
    createProduto,
    updateProduto,
    removeProduto,
    createMovimentacao,
  };
};
