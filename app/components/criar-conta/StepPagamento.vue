<script setup lang="ts">
import type { CriarContaFormState, FormaPagamento } from "~/types/usuario";
import { PLANOS } from "~/types/usuario";

const state = defineModel<CriarContaFormState>({ required: true });

// ── Forma de pagamento ────────────────────────────────────────────────────────

const formas: { value: FormaPagamento; label: string; icon: string }[] = [
  { value: "cartao", label: "Cartão de Crédito", icon: "i-lucide-credit-card" },
  { value: "boleto", label: "Boleto Bancário", icon: "i-lucide-file-text" },
  { value: "pix", label: "PIX", icon: "i-lucide-qr-code" },
];

// ── Masks ─────────────────────────────────────────────────────────────────────

function maskCardNumber(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 16);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function maskExpiry(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}

function maskCvv(v: string): string {
  return v.replace(/\D/g, "").slice(0, 4);
}

const onNumeroInput = (e: Event) => {
  const el = e.target as HTMLInputElement;
  state.value.dadosCartao.numero = maskCardNumber(el.value);
  el.value = state.value.dadosCartao.numero;
};

const onValidadeInput = (e: Event) => {
  const el = e.target as HTMLInputElement;
  state.value.dadosCartao.validade = maskExpiry(el.value);
  el.value = state.value.dadosCartao.validade;
};

const onCvvInput = (e: Event) => {
  const el = e.target as HTMLInputElement;
  state.value.dadosCartao.cvv = maskCvv(el.value);
  el.value = state.value.dadosCartao.cvv;
};

// ── Plano selecionado ─────────────────────────────────────────────────────────

const planoInfo = computed(() => PLANOS[state.value.plano]);

// ── Validação ─────────────────────────────────────────────────────────────────

const erros = ref<Record<string, string>>({});

function validarCartao(): boolean {
  const e: Record<string, string> = {};
  const c = state.value.dadosCartao;
  const digitos = c.numero.replace(/\D/g, "");

  if (digitos.length < 13) e.numero = "Número do cartão inválido";
  if (!c.nome.trim()) e.nome = "Informe o nome impresso no cartão";
  const [mm, aa] = c.validade.split("/");
  if (
    !mm ||
    !aa ||
    mm.length !== 2 ||
    aa.length !== 2 ||
    Number(mm) > 12 ||
    Number(mm) < 1
  )
    e.validade = "Validade inválida (MM/AA)";
  if (c.cvv.length < 3) e.cvv = "CVV inválido";

  erros.value = e;
  return Object.keys(e).length === 0;
}

defineExpose({
  validate(): boolean {
    if (state.value.formaPagamento === "cartao") {
      return validarCartao();
    }
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

    <!-- Seleção forma de pagamento -->
    <div>
      <p class="text-sm font-medium text-gray-700 mb-2">Forma de pagamento</p>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="forma in formas"
          :key="forma.value"
          type="button"
          class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer text-center"
          :class="
            state.formaPagamento === forma.value
              ? 'border-secondary-400 bg-secondary-50 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          "
          @click="state.formaPagamento = forma.value"
        >
          <UIcon
            :name="forma.icon"
            class="text-xl"
            :class="
              state.formaPagamento === forma.value
                ? 'text-secondary-500'
                : 'text-gray-400'
            "
          />
          <span
            class="text-xs font-medium leading-tight"
            :class="
              state.formaPagamento === forma.value
                ? 'text-secondary-700'
                : 'text-gray-600'
            "
          >
            {{ forma.label }}
          </span>
        </button>
      </div>
    </div>

    <!-- ── Cartão ────────────────────────────────────────────────────────── -->
    <div v-if="state.formaPagamento === 'cartao'" class="flex flex-col gap-4">
      <!-- Preview visual do cartão -->
      <div
        class="relative w-full h-36 rounded-2xl p-5 flex flex-col justify-between overflow-hidden text-white"
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      >
        <div class="flex items-center justify-between">
          <UIcon name="i-lucide-wifi" class="rotate-90 text-xl opacity-70" />
          <UIcon name="i-lucide-credit-card" class="text-2xl opacity-80" />
        </div>
        <div>
          <p class="font-mono text-sm tracking-widest opacity-90">
            {{ state.dadosCartao.numero || "•••• •••• •••• ••••" }}
          </p>
          <div class="flex items-end justify-between mt-1">
            <p class="text-xs opacity-70 uppercase tracking-wide">
              {{ state.dadosCartao.nome || "Nome no Cartão" }}
            </p>
            <p class="text-xs opacity-70 font-mono">
              {{ state.dadosCartao.validade || "MM/AA" }}
            </p>
          </div>
        </div>
      </div>

      <!-- Campos -->
      <div class="grid grid-cols-1 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Número do cartão</label
          >
          <input
            :value="state.dadosCartao.numero"
            type="text"
            inputmode="numeric"
            placeholder="0000 0000 0000 0000"
            maxlength="19"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-secondary-400"
            :class="erros.numero ? 'border-red-400' : ''"
            @input="onNumeroInput"
          />
          <p v-if="erros.numero" class="text-xs text-red-500 mt-1">
            {{ erros.numero }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Nome impresso no cartão</label
          >
          <input
            v-model="state.dadosCartao.nome"
            type="text"
            placeholder="NOME SOBRENOME"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-secondary-400"
            :class="erros.nome ? 'border-red-400' : ''"
            @input="
              state.dadosCartao.nome = (
                state.dadosCartao.nome || ''
              ).toUpperCase()
            "
          />
          <p v-if="erros.nome" class="text-xs text-red-500 mt-1">
            {{ erros.nome }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Validade</label
            >
            <input
              :value="state.dadosCartao.validade"
              type="text"
              inputmode="numeric"
              placeholder="MM/AA"
              maxlength="5"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-secondary-400"
              :class="erros.validade ? 'border-red-400' : ''"
              @input="onValidadeInput"
            />
            <p v-if="erros.validade" class="text-xs text-red-500 mt-1">
              {{ erros.validade }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >CVV</label
            >
            <input
              :value="state.dadosCartao.cvv"
              type="text"
              inputmode="numeric"
              placeholder="•••"
              maxlength="4"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-secondary-400"
              :class="erros.cvv ? 'border-red-400' : ''"
              @input="onCvvInput"
            />
            <p v-if="erros.cvv" class="text-xs text-red-500 mt-1">
              {{ erros.cvv }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs text-gray-400">
        <UIcon name="i-lucide-lock" class="text-green-500" />
        Seus dados são criptografados e protegidos. Nenhuma cobrança será feita
        durante o período de teste.
      </div>
    </div>

    <!-- ── Boleto ────────────────────────────────────────────────────────── -->
    <div
      v-else-if="state.formaPagamento === 'boleto'"
      class="flex flex-col gap-3"
    >
      <div
        class="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center"
      >
        <UIcon name="i-lucide-file-text" class="text-4xl text-gray-400" />
        <div>
          <p class="font-semibold text-gray-700">Boleto Bancário</p>
          <p class="text-sm text-gray-500 mt-1">
            Após a criação da conta, você receberá o boleto por e-mail com
            vencimento em <strong>3 dias úteis</strong>.
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-400 mt-2">
          <UIcon name="i-lucide-clock" class="text-amber-400" />
          A confirmação pode levar até 3 dias úteis após o pagamento.
        </div>
      </div>
    </div>

    <!-- ── PIX ───────────────────────────────────────────────────────────── -->
    <div v-else-if="state.formaPagamento === 'pix'" class="flex flex-col gap-3">
      <div
        class="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-green-200 bg-green-50 text-center"
      >
        <div class="p-3 rounded-xl bg-white border border-green-200">
          <!-- QR code placeholder -->
          <div
            class="w-28 h-28 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            <UIcon name="i-lucide-qr-code" class="text-5xl text-gray-300" />
          </div>
        </div>
        <div>
          <p class="font-semibold text-gray-700">PIX</p>
          <p class="text-sm text-gray-500 mt-1">
            Um QR Code será gerado após a criação da conta. O pagamento é
            confirmado <strong>na hora</strong>.
          </p>
        </div>
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-xs text-green-700 font-medium"
        >
          <UIcon name="i-lucide-zap" class="text-green-500" />
          Confirmação instantânea
        </div>
      </div>
    </div>
  </div>
</template>
