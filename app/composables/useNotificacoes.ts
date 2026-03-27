import type { Agendamento, StatusAgendamento } from "~/types/agendamento";

const POLLING_INTERVAL_MS = 2 * 60 * 1000; // 2 minutos

export const useNotificacoes = () => {
  const { apiFetch } = useApi();
  const pendentes = useState<Agendamento[]>("notificacoes_pendentes", () => []);
  const loading = ref(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const count = computed(() => pendentes.value.length);

  const fetchPendentes = async () => {
    try {
      pendentes.value = await apiFetch<Agendamento[]>("/agenda/pendentes");
    } catch {
      // Silencioso — não interrompe o usuário por falha de polling
    }
  };

  const resolverNotificacao = async (id: string, status: StatusAgendamento) => {
    loading.value = true;
    try {
      await apiFetch(`/agenda/${id}`, {
        method: "PATCH",
        body: { status },
      });
      pendentes.value = pendentes.value.filter((a) => a.id !== id);
    } finally {
      loading.value = false;
    }
  };

  const concluir = (id: string) => resolverNotificacao(id, "Concluido");
  const cancelar = (id: string) => resolverNotificacao(id, "Cancelado");
  const naoCompareceu = (id: string) =>
    resolverNotificacao(id, "NaoCompareceu");

  const iniciar = () => {
    fetchPendentes();
    intervalId = setInterval(fetchPendentes, POLLING_INTERVAL_MS);
  };

  const parar = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  return {
    pendentes,
    count,
    loading,
    iniciar,
    parar,
    concluir,
    cancelar,
    naoCompareceu,
  };
};
