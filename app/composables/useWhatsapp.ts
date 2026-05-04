export type WhatsappStatus =
  | "desconectado"
  | "conectando"
  | "aguardando_scan"
  | "conectado";

export interface WhatsappStatusResponse {
  status: WhatsappStatus;
  qrCode: string | null;
}

export const useWhatsapp = () => {
  const { apiFetch } = useApi();

  const status = ref<WhatsappStatus>("desconectado");
  const qrCode = ref<string | null>(null);
  const qrDataUrl = ref<string | null>(null);
  const carregando = ref(false);
  const erro = ref<string | null>(null);

  let pollingTimer: ReturnType<typeof setInterval> | null = null;

  /** Converte a string raw do QR code em imagem PNG (data URL), ou usa diretamente se já for data URL */
  async function gerarQrImage(raw: string) {
    if (!import.meta.client) return;
    if (raw.startsWith("data:")) {
      qrDataUrl.value = raw;
      return;
    }
    const QRCode = await import("qrcode");
    qrDataUrl.value = await QRCode.toDataURL(raw, { width: 256, margin: 2 });
  }

  /** Busca status atual e atualiza reativos */
  async function atualizarStatus() {
    try {
      const res = await apiFetch<WhatsappStatusResponse>("/whatsapp/status");
      status.value = res.status;
      qrCode.value = res.qrCode;

      if (res.qrCode) {
        await gerarQrImage(res.qrCode);
      } else {
        qrDataUrl.value = null;
      }

      // Para o polling quando conectado ou desconectado (sem QR)
      if (res.status === "conectado" || res.status === "desconectado") {
        pararPolling();
      }
    } catch {
      // silencioso — erros de rede não devem travar a UI
    }
  }

  function pararPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  }

  function iniciarPolling() {
    pararPolling();
    pollingTimer = setInterval(() => void atualizarStatus(), 3000);
  }

  /** Inicia sessão WhatsApp para o tenant autenticado */
  async function conectar() {
    carregando.value = true;
    erro.value = null;
    try {
      const res = await apiFetch<WhatsappStatusResponse>("/whatsapp/conectar", {
        method: "POST",
      });
      status.value = res.status;
      qrCode.value = res.qrCode;
      if (res.qrCode) await gerarQrImage(res.qrCode);
      iniciarPolling();
    } catch (e: unknown) {
      erro.value =
        (e as { data?: { message?: string } })?.data?.message ??
        "Erro ao conectar WhatsApp";
    } finally {
      carregando.value = false;
    }
  }

  /** Desconecta a sessão do tenant */
  async function desconectar() {
    carregando.value = true;
    erro.value = null;
    try {
      await apiFetch("/whatsapp/desconectar", { method: "DELETE" });
      status.value = "desconectado";
      qrCode.value = null;
      qrDataUrl.value = null;
      pararPolling();
    } catch (e: unknown) {
      erro.value =
        (e as { data?: { message?: string } })?.data?.message ??
        "Erro ao desconectar";
    } finally {
      carregando.value = false;
    }
  }

  onUnmounted(() => pararPolling());

  return {
    status,
    qrDataUrl,
    carregando,
    erro,
    atualizarStatus,
    conectar,
    desconectar,
  };
};
