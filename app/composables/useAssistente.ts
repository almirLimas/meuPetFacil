export interface MensagemChat {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const useAssistente = () => {
  const { apiFetch } = useApi();

  const mensagens = useState<MensagemChat[]>("assistente-mensagens", () => []);
  const enviando = ref(false);
  const aberto = useState<boolean>("assistente-aberto", () => false);

  const abrirAssistente = () => {
    aberto.value = true;
    if (mensagens.value.length === 0) {
      mensagens.value = [
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Olá! Sou o assistente AninPet 🐾 Posso te ajudar a cadastrar clientes, pets, criar agendamentos e muito mais. Como posso ajudar?",
        },
      ];
    }
  };

  const fecharAssistente = () => {
    aberto.value = false;
  };

  const limparConversa = () => {
    mensagens.value = [];
    abrirAssistente();
  };

  const enviar = async (texto: string) => {
    if (!texto.trim() || enviando.value) return;

    const novaMensagem: MensagemChat = {
      id: crypto.randomUUID(),
      role: "user",
      content: texto.trim(),
    };

    mensagens.value = [...mensagens.value, novaMensagem];
    enviando.value = true;

    try {
      const historico = mensagens.value
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map(({ role, content }) => ({ role, content }));

      const { resposta, acoesRealizadas } = await apiFetch<{
        resposta: string;
        acoesRealizadas: string[];
      }>("/ia/chat", {
        method: "POST",
        body: { mensagens: historico },
      });

      mensagens.value = [
        ...mensagens.value,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: resposta,
        },
      ];

      if (acoesRealizadas?.length) {
        const { refresh: refreshAgenda } = useAgenda();
        const { fetchAll: fetchServicos } = useServicos();
        const { fetchProdutos } = useEstoque();

        for (const acao of acoesRealizadas) {
          if (acao === "cadastrar_cliente" || acao === "cadastrar_pet") {
            await refreshNuxtData("clientes");
          } else if (
            acao === "criar_agendamento" ||
            acao === "atualizar_agendamento"
          ) {
            await refreshAgenda();
          } else if (acao === "cadastrar_servico") {
            await fetchServicos();
          } else if (acao === "cadastrar_produto") {
            await fetchProdutos();
          }
        }
      }
    } catch {
      mensagens.value = [
        ...mensagens.value,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.",
        },
      ];
    } finally {
      enviando.value = false;
    }
  };

  return {
    mensagens: readonly(mensagens),
    enviando: readonly(enviando),
    aberto: readonly(aberto),
    abrirAssistente,
    fecharAssistente,
    limparConversa,
    enviar,
  };
};
