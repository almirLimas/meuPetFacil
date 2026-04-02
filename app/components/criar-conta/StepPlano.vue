<script setup lang="ts">
import type { CriarContaFormState, PlanoSistema } from "~/types/usuario";
import { PLANOS, MODULO_LABELS } from "~/types/usuario";

const state = defineModel<CriarContaFormState>({ required: true });

const planosList = computed(() =>
  (
    Object.entries(PLANOS) as [PlanoSistema, (typeof PLANOS)[PlanoSistema]][]
  ).map(([key, info]) => ({ key, ...info })),
);

function selecionarPlano(plano: PlanoSistema) {
  state.value.plano = plano;
}

defineExpose({
  validate(): boolean {
    return !!state.value.plano;
  },
});
</script>

<template>
  <div class="flex flex-col gap-5">
    <p class="text-sm text-gray-500 text-center">
      Escolha o plano ideal para o seu negócio. Você pode mudar a qualquer
      momento.
    </p>

    <div class="grid grid-cols-1 gap-4">
      <button
        v-for="plano in planosList"
        :key="plano.key"
        type="button"
        class="relative flex flex-col gap-3 p-5 rounded-xl border-2 transition-all text-left cursor-pointer"
        :class="
          state.plano === plano.key
            ? 'border-secondary-400 bg-secondary-50 shadow-md'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        "
        @click="selecionarPlano(plano.key)"
      >
        <!-- Badge destaque -->
        <span
          v-if="plano.destaque"
          class="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-secondary-500 text-white whitespace-nowrap"
        >
          ⭐ Mais popular
        </span>

        <div class="flex items-start justify-between gap-4">
          <!-- Info -->
          <div class="flex flex-col gap-1">
            <p class="font-bold text-gray-800 text-base">{{ plano.nome }}</p>
            <p class="text-sm text-gray-500">{{ plano.descricao }}</p>
          </div>

          <!-- Preço + check -->
          <div class="flex flex-col items-end gap-1 shrink-0">
            <div class="text-right">
              <span class="text-2xl font-extrabold text-gray-900"
                >R$ {{ plano.preco }}</span
              >
              <span class="text-xs text-gray-400">/mês</span>
            </div>
            <span class="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full whitespace-nowrap">
              🎁 14 dias grátis
            </span>
            <div
              v-if="state.plano === plano.key"
              class="w-5 h-5 rounded-full bg-secondary-500 flex items-center justify-center mt-1"
            >
              <UIcon name="i-lucide-check" class="text-white text-xs" />
            </div>
          </div>
        </div>

        <!-- Módulos incluídos -->
        <div class="flex flex-wrap gap-2 mt-1">
          <span
            v-for="modulo in plano.modulos"
            :key="modulo"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            :class="
              state.plano === plano.key
                ? 'bg-secondary-100 text-secondary-700'
                : 'bg-gray-100 text-gray-600'
            "
          >
            <UIcon
              name="i-lucide-check-circle-2"
              class="text-green-500 text-xs"
            />
            {{ MODULO_LABELS[modulo] ?? modulo }}
          </span>
        </div>
      </button>
    </div>

    <!-- Nota informativa -->
    <p class="text-xs text-center text-gray-400">
      Sem cartão agora. O pagamento começa somente após os 14 dias de teste.
    </p>
  </div>
</template>
