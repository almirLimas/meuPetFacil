import type {
  Agendamento,
  CreateAgendamentoPayload,
  StatusAgendamento,
} from "~/types/agendamento";

export const useAgenda = () => {
  const { apiFetch } = useApi();

  const agendamentos = useState<Agendamento[]>("agenda", () => []);
  const loading = ref(false);

  const fetchByDate = async (date: string) => {
    loading.value = true;
    try {
      agendamentos.value = await apiFetch<Agendamento[]>(
        `/agenda?data=${date}`,
      );
    } catch {
      agendamentos.value = [];
    } finally {
      loading.value = false;
    }
  };

  const create = async (payload: CreateAgendamentoPayload) => {
    const novo = await apiFetch<Agendamento>("/agenda", {
      method: "POST",
      body: payload,
    });
    agendamentos.value.push(novo);
    return novo;
  };

  const updateStatus = async (id: string, status: StatusAgendamento) => {
    const updated = await apiFetch<Agendamento>(`/agenda/${id}`, {
      method: "PATCH",
      body: { status },
    });
    const idx = agendamentos.value.findIndex((a) => a.id === id);
    if (idx !== -1) agendamentos.value[idx] = updated;
    return updated;
  };

  const update = async (
    id: string,
    payload: {
      servicoIds?: string[];
      status?: StatusAgendamento;
      dataHora?: string;
      modalidade?: string;
      taxaBusca?: number;
      enderecoBusca?: string;
      observacoes?: string;
    },
  ) => {
    const updated = await apiFetch<Agendamento>(`/agenda/${id}`, {
      method: "PATCH",
      body: payload,
    });
    const idx = agendamentos.value.findIndex((a) => a.id === id);
    if (idx !== -1) agendamentos.value[idx] = updated;
    return updated;
  };

  return { agendamentos, loading, fetchByDate, create, update, updateStatus };
};
