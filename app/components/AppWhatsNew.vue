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

const VERSAO_ATUAL = "1.5.0";

const changelog: Versao[] = [
  {
    versao: "1.5.0",
    data: "21 de abril de 2026",
    novidades: [
      {
        tipo: "novo",
        texto:
          "Forma de pagamento no agendamento — informe Dinheiro, PIX, Débito ou Crédito ao concluir o atendimento",
      },
      {
        tipo: "novo",
        texto:
          "Cards de faturamento por pagamento no Financeiro — veja o total recebido em Pix, Dinheiro e Cartão",
      },
      {
        tipo: "melhoria",
        texto:
          "Histórico financeiro exibe a forma de pagamento de cada lançamento",
      },
      {
        tipo: "melhoria",
        texto:
          "Categorias no financeiro agora têm cores distintas (Serviço, Produto, Consulta etc.)",
      },
    ],
  },
  {
    versao: "1.4.0",
    data: "20 de abril de 2026",
    novidades: [
      {
        tipo: "novo",
        texto:
          "Agendamentos recorrentes para clientes mensalistas — crie semanas de uma vez só",
      },
      {
        tipo: "novo",
        texto: "Cobrança de mensalidade automática a cada 4 sessões concluídas",
      },
      {
        tipo: "novo",
        texto:
          "Produtos a granel (ração, shampoo etc.) — venda por valor e o estoque desconta em g/ml automaticamente",
      },
      {
        tipo: "melhoria",
        texto:
          "Assistente IA entende mensalistas e cria agendamentos recorrentes pelo chat",
      },
      {
        tipo: "novo",
        texto:
          "IA Anin agora responde dúvidas e dá suporte direto no chat — sem precisar sair do sistema",
      },
    ],
  },
  {
    versao: "1.3.0",
    data: "7 de abril de 2026",
    novidades: [
      {
        tipo: "novo",
        texto: "Avaliações de clientes com link exclusivo por WhatsApp",
      },
      {
        tipo: "novo",
        texto: "CPF no cadastro do usuário",
      },
      {
        tipo: "melhoria",
        texto: "Taxa de busca agora aparece separada na OS",
      },
    ],
  },
  {
    versao: "1.2.0",
    data: "1 de abril de 2026",
    novidades: [
      {
        tipo: "novo",
        texto: "Plano Plus com limites expandidos",
      },
      {
        tipo: "novo",
        texto: "E-mails de aviso de fim do trial",
      },
      {
        tipo: "melhoria",
        texto: "Meta mensal de faturamento no dashboard",
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
