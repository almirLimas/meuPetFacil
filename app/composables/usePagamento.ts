import type { PlanoSistema } from "~/types/usuario";

export type ResultadoCheckout = { tipo: "checkout"; url: string };
export type ResultadoTrial = { tipo: "trial"; trialExpiraEm: string };
export type ResultadoPix = {
  tipo: "pix";
  qrCode: string;
  qrCodeBase64: string;
  valor: number;
};
export type ResultadoPagamento =
  | ResultadoCheckout
  | ResultadoTrial
  | ResultadoPix;

export const usePagamento = () => {
  const { apiFetch } = useApi();

  const iniciarPagamento = (dados: {
    plano: PlanoSistema;
    formaPagamento: "cartao" | "pix";
    cpf?: string;
  }) =>
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

  return { iniciarPagamento, renovarAssinatura, obterStatus };
};
