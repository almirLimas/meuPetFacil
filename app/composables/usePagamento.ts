import type { PlanoSistema } from "~/types/usuario";

export type ResultadoCheckout = { tipo: "checkout"; url: string };
export type ResultadoTrial = { tipo: "trial"; trialExpiraEm: string };
export type ResultadoPagamento = ResultadoCheckout | ResultadoTrial;

export const usePagamento = () => {
  const { apiFetch } = useApi();

  const iniciarPagamento = (dados: { plano: PlanoSistema }) =>
    apiFetch<ResultadoPagamento>("/pagamento/iniciar", {
      method: "POST",
      body: dados,
    });

  const renovarAssinatura = (plano?: PlanoSistema) =>
    apiFetch<ResultadoCheckout>("/pagamento/renovar", {
      method: "POST",
      body: plano ? { plano } : {},
    });

  const obterStatus = () =>
    apiFetch<{
      assinaturaStatus: string;
      trialExpiraEm: string | null;
      plano: PlanoSistema;
    }>("/pagamento/status");

  const cancelarAssinatura = () =>
    apiFetch<{ cancelada: boolean }>("/pagamento/cancelar", {
      method: "DELETE",
    });

  const trocarPlano = (plano: PlanoSistema) =>
    apiFetch<{ plano: PlanoSistema }>("/pagamento/plano", {
      method: "PATCH",
      body: { plano },
    });

  return {
    iniciarPagamento,
    renovarAssinatura,
    obterStatus,
    cancelarAssinatura,
    trocarPlano,
  };
};
