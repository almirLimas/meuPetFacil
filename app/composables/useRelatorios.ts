import { useApi } from "~/composables/useApi";

export interface ResumoRelatorio {
  mes: string;
  novosClientes: number;
  totalClientesAtivos: number;
  clientesRetornaram: number;
  clientesNaoVoltaram: number;
  taxaRetorno: number;
  agendamentos: {
    total: number;
    concluidos: number;
    cancelados: number;
    naoCompareceu: number;
  };
  faturamento: number;
}

export interface ClienteNaoVoltou {
  id: string;
  nome: string;
  telefonePrincipal: string;
  email: string | null;
  ultimoAgendamento: string;
  servicos: string;
  diasSemVoltar: number;
}

export interface ClientesNaoVoltaramResponse {
  dias: number;
  total: number;
  clientes: ClienteNaoVoltou[];
}

export interface ServicoPopular {
  servicoId: string;
  nome: string;
  categoria: string;
  quantidade: number;
  receitaEstimada: number;
}

export const useRelatorios = () => {
  const { apiFetch } = useApi();

  const resumo = ref<ResumoRelatorio | null>(null);
  const clientesNaoVoltaram = ref<ClientesNaoVoltaramResponse | null>(null);
  const servicosPopulares = ref<ServicoPopular[]>([]);
  const loading = ref(false);
  const loadingClientes = ref(false);

  const fetchResumo = async (mes: string) => {
    loading.value = true;
    try {
      resumo.value = await apiFetch<ResumoRelatorio>(
        `/relatorios/resumo?mes=${mes}`,
      );
    } finally {
      loading.value = false;
    }
  };

  const fetchClientesNaoVoltaram = async (dias = 30) => {
    loadingClientes.value = true;
    try {
      clientesNaoVoltaram.value = await apiFetch<ClientesNaoVoltaramResponse>(
        `/relatorios/clientes-nao-voltaram?dias=${dias}`,
      );
    } finally {
      loadingClientes.value = false;
    }
  };

  const fetchServicosPopulares = async (mes: string) => {
    servicosPopulares.value = await apiFetch<ServicoPopular[]>(
      `/relatorios/servicos-populares?mes=${mes}`,
    );
  };

  const _montarMensagem = (nomeCliente: string, diasSemVoltar: number) =>
    `Olá, ${nomeCliente}! 👋\n\nAqui é do nosso petshop. Já faz ${diasSemVoltar} dias desde a última visita e sentimos muita falta de vocês! 🐾\n\nQue tal agendarmos um banho ou uma tosa essa semana? Estamos com horários disponíveis e adoraríamos recebê-los novamente. 😊\n\nResponda aqui para marcarmos o horário!`;

  const gerarLinkWhatsApp = (
    telefone: string,
    nomeCliente: string,
    diasSemVoltar: number,
  ) => {
    const tel = telefone.replaceAll(/[^0-9]/g, "");
    const numero = tel.startsWith("55") ? tel : `55${tel}`;
    const mensagem = encodeURIComponent(
      _montarMensagem(nomeCliente, diasSemVoltar),
    );
    return `https://wa.me/${numero}?text=${mensagem}`;
  };

  // ── Envio via API (simulação ou Evolution API) ────────────────────────────

  interface ResultadoEnvio {
    sucesso: boolean;
    simulado: boolean;
    mensagem: string;
    telefone: string;
    enviadoEm: string;
    detalhes?: string;
  }

  const enviandoWhatsApp = ref<Record<string, boolean>>({});

  const enviarWhatsAppApi = async (
    cliente: ClienteNaoVoltou,
  ): Promise<ResultadoEnvio> => {
    enviandoWhatsApp.value[cliente.id] = true;
    try {
      return await apiFetch<ResultadoEnvio>("/whatsapp/enviar", {
        method: "POST",
        body: {
          telefone: cliente.telefonePrincipal,
          mensagem: _montarMensagem(cliente.nome, cliente.diasSemVoltar),
          clienteId: cliente.id,
          nomeCliente: cliente.nome,
        },
      });
    } finally {
      enviandoWhatsApp.value[cliente.id] = false;
    }
  };

  return {
    resumo,
    clientesNaoVoltaram,
    servicosPopulares,
    loading,
    loadingClientes,
    enviandoWhatsApp,
    fetchResumo,
    fetchClientesNaoVoltaram,
    fetchServicosPopulares,
    gerarLinkWhatsApp,
    enviarWhatsAppApi,
  };
};
