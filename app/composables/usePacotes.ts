import type { PacoteServico, PacoteClienteAtivo } from "~/types/pacote";

export const usePacotes = () => {
  const { apiFetch } = useApi();
  const pacotes = useState<PacoteServico[]>("pacotes", () => []);
  const loading = ref(false);

  // ── Templates de pacote ──────────────────────────────────────────────────

  const fetchAll = async (apenasAtivos = false) => {
    loading.value = true;
    try {
      const params = apenasAtivos ? "?ativos=true" : "";
      pacotes.value = await apiFetch<PacoteServico[]>(`/pacotes${params}`);
      return pacotes.value;
    } finally {
      loading.value = false;
    }
  };

  const create = async (
    payload: Omit<PacoteServico, "id" | "tenantId" | "createdAt" | "updatedAt">,
  ) => {
    const novo = await apiFetch<PacoteServico>("/pacotes", {
      method: "POST",
      body: payload,
    });
    pacotes.value.unshift(novo);
    return novo;
  };

  const update = async (id: string, payload: Partial<PacoteServico>) => {
    const updated = await apiFetch<PacoteServico>(`/pacotes/${id}`, {
      method: "PATCH",
      body: payload,
    });
    const idx = pacotes.value.findIndex((p) => p.id === id);
    if (idx !== -1) pacotes.value[idx] = updated;
    return updated;
  };

  const remove = async (id: string) => {
    await apiFetch(`/pacotes/${id}`, { method: "DELETE" });
    pacotes.value = pacotes.value.filter((p) => p.id !== id);
  };

  // ── Pacotes ativos de clientes ───────────────────────────────────────────

  const ativar = async (payload: {
    pacoteId: string;
    clienteId: string;
    petId?: string;
  }) => {
    return apiFetch<PacoteClienteAtivo>("/pacotes/ativar", {
      method: "POST",
      body: payload,
    });
  };

  const registrarUso = async (pacoteClienteId: string) => {
    return apiFetch<PacoteClienteAtivo>(`/pacotes/uso/${pacoteClienteId}`, {
      method: "PATCH",
    });
  };

  const cancelar = async (pacoteClienteId: string) => {
    return apiFetch<PacoteClienteAtivo>(
      `/pacotes/cancelar/${pacoteClienteId}`,
      { method: "PATCH" },
    );
  };

  const fetchPacotesCliente = async (clienteId: string) => {
    return apiFetch<PacoteClienteAtivo[]>(`/pacotes/clientes/${clienteId}`);
  };

  const fetchTodosAtivos = async () => {
    return apiFetch<PacoteClienteAtivo[]>("/pacotes/clientes/ativos");
  };

  const enviarWhatsapp = async (pacoteId: string, clienteId: string) => {
    return apiFetch<{ sucesso: boolean; simulado: boolean; mensagem: string }>(
      `/pacotes/${pacoteId}/enviar-whatsapp`,
      { method: "POST", body: { clienteId } },
    );
  };

  return {
    pacotes,
    loading,
    fetchAll,
    create,
    update,
    remove,
    ativar,
    registrarUso,
    cancelar,
    fetchPacotesCliente,
    fetchTodosAtivos,
    enviarWhatsapp,
  };
};
