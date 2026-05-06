<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

interface Novidade {
  tipo: "novo" | "melhoria" | "correcao";
  texto: string;
}

interface Versao {
  versao: string;
  data: string;
  novidades: Novidade[];
}

const VERSAO_ATUAL = "1.8.0";

const changelog: Versao[] = [
  {
    versao: "1.8.0",
    data: "6 de maio de 2026",
    novidades: [
      {
        tipo: "novo",
        texto:
          "Pacotes de serviços — crie pacotes com N sessões, defina valor e validade. O sistema debita uma sessão a cada atendimento concluído e gera o lançamento financeiro automaticamente ao esgotar o pacote",
      },
      {
        tipo: "novo",
        texto:
          "Ativação de pacote para o cliente — acesse o perfil do cliente, aba Pacotes, e vincule um pacote. Ao ativar, é possível já agendar todas as sessões recorrentes de uma vez",
      },
      {
        tipo: "melhoria",
        texto:
          "Filtro de origem no Financeiro — filtre lançamentos por Agendamentos ou Loja (PDV) para visualizar receitas separadas",
      },
      {
        tipo: "melhoria",
        texto:
          "Endereço de busca na agenda — agendamentos com modalidade 'Petshop busca' agora exibem o endereço completo na tabela sem corte",
      },
      {
        tipo: "melhoria",
        texto:
          "Campo de endereço editável no novo agendamento — antes o campo era bloqueado; agora é possível ajustar manualmente o endereço de busca",
      },
    ],
  },
  {
    versao: "1.7.0",
    data: "4 de maio de 2026",
    novidades: [
      {
        tipo: "novo",
        texto:
          "Integração com WhatsApp — conecte o número da sua petshop e envie mensagens automáticas para os clientes",
      },
      {
        tipo: "novo",
        texto:
          "Confirmação automática de agendamento via WhatsApp — o cliente recebe a mensagem assim que o agendamento é criado",
      },
      {
        tipo: "novo",
        texto:
          "Pesquisa de satisfação via WhatsApp — ao concluir um agendamento, o cliente recebe automaticamente um link para avaliação",
      },
      {
        tipo: "novo",
        texto:
          "Personalização de mensagens — edite os templates de confirmação e de pesquisa de satisfação direto no painel (menu WhatsApp)",
      },
    ],
  },
];

const tipoConfig = {
  novo: {
    label: "Novo",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    icon: "i-lucide-sparkles",
  },
  melhoria: {
    label: "Melhoria",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    icon: "i-lucide-arrow-up-circle",
  },
  correcao: {
    label: "Correção",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    icon: "i-lucide-wrench",
  },
};

const fechar = () => {
  if (import.meta.client) {
    localStorage.setItem("whats_new_last_seen", VERSAO_ATUAL);
  }
  open.value = false;
};
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'max-w-2xl' }" @close="fechar">
    <template #content>
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-[#1d9fb6]/10 flex items-center justify-center"
            >
              <UIcon name="i-lucide-rocket" class="size-5 text-[#1d9fb6]" />
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                Novidades do sistema
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Veja o que foi atualizado
              </p>
            </div>
          </div>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="fechar"
          />
        </div>

        <!-- Changelog -->
        <div class="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          <div v-for="versao in changelog" :key="versao.versao">
            <!-- Versão badge + data -->
            <div class="flex items-center gap-2 mb-3">
              <span
                class="text-xs font-bold px-2 py-0.5 rounded-full bg-[#1d9fb6] text-white"
              >
                v{{ versao.versao }}
              </span>
              <span class="text-xs text-gray-400 dark:text-gray-500">
                {{ versao.data }}
              </span>
              <div class="flex-1 h-px bg-gray-100 dark:bg-neutral-800" />
            </div>

            <!-- Itens -->
            <ul class="space-y-2">
              <li
                v-for="(item, i) in versao.novidades"
                :key="i"
                class="flex items-start gap-2.5"
              >
                <span
                  :class="[
                    'mt-0.5 shrink-0 inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full',
                    tipoConfig[item.tipo].color,
                  ]"
                >
                  <UIcon :name="tipoConfig[item.tipo].icon" class="size-3" />
                  {{ tipoConfig[item.tipo].label }}
                </span>
                <span
                  class="text-sm text-gray-700 dark:text-gray-300 leading-snug"
                >
                  {{ item.texto }}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="mt-5 pt-4 border-t border-gray-100 dark:border-neutral-800 flex justify-end"
        >
          <UButton label="Entendido!" color="primary" @click="fechar" />
        </div>
      </div>
    </template>
  </UModal>
</template>
