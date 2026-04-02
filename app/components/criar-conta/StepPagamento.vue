<script setup lang="ts">
import type { CriarContaFormState } from "~/types/usuario";
import { PLANOS } from "~/types/usuario";

const state = defineModel<CriarContaFormState>({ required: true });

// Trial sem cartão: backend retorna tipo:'trial' quando formaPagamento='cartao'
state.value.formaPagamento = "cartao";

const planoInfo = computed(() => PLANOS[state.value.plano]);
const precoMensal = computed(() => planoInfo.value.preco);

defineExpose({
  validate(): boolean {
    return true;
  },
});
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Destaque: trial gratuito -->
    <div
      class="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-secondary-300 bg-secondary-50 text-center"
    >
      <div
        class="p-3 rounded-2xl bg-white border border-secondary-100 shadow-sm"
      >
        <UIcon
          name="i-lucide-party-popper"
          class="text-4xl text-secondary-500"
        />
      </div>
      <div>
        <p class="text-lg font-bold text-gray-800">
          14 dias grátis, sem cartão!
        </p>
        <p class="text-sm text-gray-500 mt-1">
          Explore o sistema sem compromisso. Nenhum dado de pagamento é
          solicitado agora.
        </p>
      </div>
    </div>

    <!-- Resumo do plano -->
    <div
      class="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200"
    >
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-package-check"
          class="text-secondary-500 text-lg"
        />
        <div>
          <p class="text-xs text-gray-500">Plano selecionado</p>
          <p class="text-sm font-bold text-gray-800">{{ planoInfo.nome }}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-base font-extrabold text-secondary-700">
          R$ {{ precoMensal
          }}<span class="text-xs font-normal text-gray-400">/mês</span>
        </p>
        <p class="text-xs text-gray-400">após o trial</p>
      </div>
    </div>

    <!-- O que acontece depois -->
    <div class="flex flex-col gap-2">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Como funciona
      </p>
      <div class="flex items-start gap-3 text-sm text-gray-600">
        <div
          class="w-6 h-6 rounded-full bg-secondary-100 text-secondary-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5"
        >
          1
        </div>
        <p>
          Hoje — sua conta é criada e você tem
          <strong>14 dias de acesso total grátis</strong>.
        </p>
      </div>
      <div class="flex items-start gap-3 text-sm text-gray-600">
        <div
          class="w-6 h-6 rounded-full bg-secondary-100 text-secondary-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5"
        >
          2
        </div>
        <p>
          No 14º dia — você recebe um aviso e
          <strong>adiciona seu cartão</strong> para continuar.
        </p>
      </div>
      <div class="flex items-start gap-3 text-sm text-gray-600">
        <div
          class="w-6 h-6 rounded-full bg-secondary-100 text-secondary-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5"
        >
          3
        </div>
        <p>
          Após ativar — cobrança mensal de <strong>R$ {{ precoMensal }}</strong
          >. Cancele quando quiser.
        </p>
      </div>
    </div>

    <p class="text-xs text-center text-gray-400">
      <UIcon name="i-lucide-lock" class="inline text-green-500 mr-1" />
      Pagamento processado com segurança pelo Mercado Pago na ativação.
    </p>
  </div>
</template>
