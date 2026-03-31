<script setup lang="ts">
import type { CriarContaFormState, FormaPagamento } from "~/types/usuario";
import { PLANOS } from "~/types/usuario";

const state = defineModel<CriarContaFormState>({ required: true });

const formas: {
  value: FormaPagamento;
  label: string;
  icon: string;
  em_breve?: boolean;
}[] = [
  {
    value: "cartao",
    label: "Cartão de Crédito",
    icon: "i-lucide-credit-card",
  },
  {
    value: "pix",
    label: "PIX Anual",
    icon: "i-lucide-qr-code",
  },
  {
    value: "boleto",
    label: "Boleto",
    icon: "i-lucide-file-text",
    em_breve: true,
  },
];

const planoInfo = computed(() => PLANOS[state.value.plano]);
const precoMensal = computed(() => planoInfo.value.preco);
const valorAnual = computed(() =>
  Number((precoMensal.value * 12 * 0.8).toFixed(2)),
);
const economia = computed(() =>
  Number((precoMensal.value * 12 - valorAnual.value).toFixed(2)),
);

function maskCpf(v: string): string {
  const d = v.replaceAll(/\D/g, "").slice(0, 11);
  if (d.length > 9)
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}

const onCpfInput = (e: Event) => {
  const el = e.target as HTMLInputElement;
  state.value.cpf = maskCpf(el.value);
  el.value = state.value.cpf;
};

const erroCpf = ref("");

defineExpose({
  validate(): boolean {
    if (state.value.formaPagamento === "pix") {
      const digitos = (state.value.cpf ?? "").replaceAll(/\D/g, "");
      if (digitos.length !== 11) {
        erroCpf.value = "CPF inválido";
        return false;
      }
    }
    erroCpf.value = "";
    return true;
  },
});
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Resumo do plano -->
    <div
      class="flex items-center justify-between p-3 rounded-lg bg-secondary-50 border border-secondary-200"
    >
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-package-check"
          class="text-secondary-500 text-lg"
        />
        <div>
          <p class="text-xs text-secondary-600 font-medium">
            Plano selecionado
          </p>
          <p class="text-sm font-bold text-secondary-800">
            {{ planoInfo.nome }}
          </p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-lg font-extrabold text-secondary-700">
          R$ {{ planoInfo.preco }}<span class="text-xs font-normal">/mês</span>
        </p>
        <p class="text-xs text-secondary-500">após 14 dias grátis</p>
      </div>
    </div>

    <!-- Selecao forma de pagamento -->
    <div>
      <p class="text-sm font-medium text-gray-700 mb-2">Forma de pagamento</p>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="forma in formas"
          :key="forma.value"
          type="button"
          :disabled="forma.em_breve"
          class="relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center"
          :class="[
            forma.em_breve
              ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50'
              : state.formaPagamento === forma.value
                ? 'border-secondary-400 bg-secondary-50 shadow-sm cursor-pointer'
                : 'border-gray-200 hover:border-gray-300 bg-white cursor-pointer',
          ]"
          @click="!forma.em_breve && (state.formaPagamento = forma.value)"
        >
          <UIcon
            :name="forma.icon"
            class="text-xl"
            :class="
              state.formaPagamento === forma.value && !forma.em_breve
                ? 'text-secondary-500'
                : 'text-gray-400'
            "
          />
          <span
            class="text-xs font-medium leading-tight"
            :class="
              state.formaPagamento === forma.value && !forma.em_breve
                ? 'text-secondary-700'
                : 'text-gray-600'
            "
          >
            {{ forma.label }}
          </span>
          <span
            v-if="forma.em_breve"
            class="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-300 text-gray-600 whitespace-nowrap"
          >
            Em breve
          </span>
        </button>
      </div>
    </div>

    <!-- Cartao -->
    <div v-if="state.formaPagamento === 'cartao'" class="flex flex-col gap-4">
      <div
        class="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-secondary-200 bg-secondary-50 text-center"
      >
        <div
          class="p-3 rounded-xl bg-white border border-secondary-100 shadow-sm"
        >
          <UIcon
            name="i-lucide-shield-check"
            class="text-4xl text-secondary-500"
          />
        </div>
        <div>
          <p class="font-semibold text-gray-800">
            Pagamento seguro via Mercado Pago
          </p>
          <p class="text-sm text-gray-500 mt-1">
            Ao confirmar, você será redirecionado ao ambiente seguro do
            <strong>Mercado Pago</strong> para cadastrar seu cartão de crédito.
          </p>
        </div>
        <div class="flex flex-col gap-1.5 w-full text-left">
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <UIcon
              name="i-lucide-check-circle-2"
              class="text-green-500 shrink-0"
            />
            Cobrança mensal de <strong>R$ {{ precoMensal }}</strong>
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <UIcon
              name="i-lucide-check-circle-2"
              class="text-green-500 shrink-0"
            />
            Cancele a qualquer momento sem multa
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <UIcon
              name="i-lucide-check-circle-2"
              class="text-green-500 shrink-0"
            />
            Nenhuma cobrança durante os 14 dias de teste
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-400">
        <UIcon name="i-lucide-lock" class="text-green-500" />
        Seus dados são processados com criptografia SSL pelo Mercado Pago.
      </div>
    </div>

    <!-- PIX Anual -->
    <div v-else-if="state.formaPagamento === 'pix'" class="flex flex-col gap-4">
      <div
        class="flex items-center justify-between p-4 rounded-xl border-2 border-green-200 bg-green-50"
      >
        <div>
          <p class="text-sm font-semibold text-green-800">Plano Anual (PIX)</p>
          <p class="text-xs text-green-600 mt-0.5">
            Economia de <strong>R$ {{ economia.toFixed(2) }}</strong> vs
            mensalidade
          </p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-extrabold text-green-700">
            R$ {{ valorAnual.toFixed(2) }}
          </p>
          <p class="text-xs text-green-500 line-through">
            R$ {{ (precoMensal * 12).toFixed(2) }}/ano
          </p>
        </div>
      </div>

      <div class="flex justify-center">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold"
        >
          <UIcon name="i-lucide-tag" class="text-base" />
          20% de desconto no plano anual
        </span>
      </div>

      <div>
        <label for="cpf" class="block text-sm font-medium text-gray-700 mb-1">
          CPF do responsável
          <span aria-hidden="true" class="text-red-500">*</span>
        </label>
        <input
          id="cpf"
          :value="state.cpf"
          type="text"
          inputmode="numeric"
          placeholder="000.000.000-00"
          maxlength="14"
          class="w-full rounded-lg border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-secondary-400"
          :class="erroCpf ? 'border-red-400' : 'border-gray-300'"
          @input="onCpfInput"
        />
        <p v-if="erroCpf" class="text-xs text-red-500 mt-1">{{ erroCpf }}</p>
        <p class="text-xs text-gray-400 mt-1">
          Necessário para emissão do recibo fiscal do PIX.
        </p>
      </div>

      <div class="flex items-center gap-2 text-xs text-gray-400">
        <UIcon name="i-lucide-zap" class="text-green-500" />
        O QR Code PIX será gerado após criar a conta. Confirmação instantânea.
      </div>
    </div>
  </div>
</template>
