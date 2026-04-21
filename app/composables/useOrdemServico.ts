import type {
  OrdemServico,
  AddItemOsPayload,
  FinalizarOsPayload,
  ItemOrdemServico,
} from "~/types/ordemServico";

export const useOrdemServico = () => {
  const { apiFetch } = useApi();

  const abrirOuBuscar = (agendamentoId: string): Promise<OrdemServico> =>
    apiFetch<OrdemServico>(`/ordem-servico/agendamento/${agendamentoId}`, {
      method: "POST",
    });

  const buscarPorAgendamento = (
    agendamentoId: string,
  ): Promise<OrdemServico | null> =>
    apiFetch<OrdemServico | null>(
      `/ordem-servico/agendamento/${agendamentoId}`,
    );

  const addItem = (
    osId: string,
    payload: AddItemOsPayload,
  ): Promise<ItemOrdemServico> =>
    apiFetch<ItemOrdemServico>(`/ordem-servico/${osId}/itens`, {
      method: "POST",
      body: payload,
    });

  const removeItem = (osId: string, itemId: string): Promise<void> =>
    apiFetch<void>(`/ordem-servico/${osId}/itens/${itemId}`, {
      method: "DELETE",
    });

  const finalizar = (
    osId: string,
    payload: FinalizarOsPayload,
  ): Promise<OrdemServico> =>
    apiFetch<OrdemServico>(`/ordem-servico/${osId}/finalizar`, {
      method: "POST",
      body: payload,
    });

  return {
    abrirOuBuscar,
    buscarPorAgendamento,
    addItem,
    removeItem,
    finalizar,
  };
};
