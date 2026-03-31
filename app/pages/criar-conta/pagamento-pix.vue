<script setup lang="ts">
import type { ResultadoPagamento } from "~/composables/usePagamento";

definePageMeta({ layout: false });

const pixCheckout = useState<ResultadoPagamento | null>("pix-checkout");

// Redireciona se acessado diretamente sem dados
onMounted(() => {
  if (!pixCheckout.value || pixCheckout.value.tipo !== "pix") {
    navigateTo("/criar-conta");
  }
});

const dados = computed(() =>
  pixCheckout.value?.tipo === "pix" ? pixCheckout.value : null,
);

const copiado = ref(false);
const copiarPix = async () => {
  if (!dados.value?.qrCode) return;
  await navigator.clipboard.writeText(dados.value.qrCode);
  copiado.value = true;
  setTimeout(() => (copiado.value = false), 3000);
};

// Polling para verificar se o pagamento foi confirmado
const { obterStatus } = usePagamento();
const pago = ref(false);

let polling: ReturnType<typeof setInterval>;
onMounted(() => {
  polling = setInterval(async () => {
    try {
      const status = await obterStatus();
      if (status.assinaturaStatus === "ativa") {
        pago.value = true;
        clearInterval(polling);
        setTimeout(() => navigateTo("/login"), 3000);
      }
    } catch {
      // Ignora erros de polling
    }
  }, 5000);
});
onUnmounted(() => clearInterval(polling));
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50"
  >
    <div class="w-full max-w-md">
      <!-- Sucesso após confirmação -->
      <UCard v-if="pago" class="text-center py-8">
        <div class="flex flex-col items-center gap-4">
          <div
            class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-check-circle-2"
              class="text-4xl text-green-500"
            />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-800">
              Pagamento confirmado!
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Sua assinatura está ativa. Redirecionando para o login...
            </p>
          </div>
          <UIcon
            name="i-lucide-loader-circle"
            class="animate-spin text-secondary-400 text-2xl"
          />
        </div>
      </UCard>

      <!-- Aguardando pagamento -->
      <UCard v-else-if="dados" class="shadow-lg ring-0">
        <template #header>
          <div class="flex flex-col items-center gap-2 pt-2">
            <div
              class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center"
            >
              <UIcon name="i-lucide-qr-code" class="text-2xl text-green-600" />
            </div>
            <h1 class="text-lg font-bold text-gray-800">Pague com PIX</h1>
            <p class="text-sm text-gray-500 text-center">
              Escaneie o QR Code ou copie o código abaixo para concluir sua
              assinatura.
            </p>
          </div>
        </template>

        <div class="flex flex-col items-center gap-5">
          <!-- Valor -->
          <div class="text-center">
            <p class="text-xs text-gray-500">Valor a pagar</p>
            <p class="text-3xl font-extrabold text-gray-800">
              R$ {{ dados.valor.toFixed(2) }}
            </p>
            <p class="text-xs text-gray-400">Plano anual — pagamento único</p>
          </div>

          <!-- QR Code -->
          <div class="border-4 border-green-400 rounded-2xl p-3 bg-white">
            <img
              v-if="dados.qrCodeBase64"
              :src="`data:image/png;base64,${dados.qrCodeBase64}`"
              alt="QR Code PIX"
              width="220"
              height="220"
            />
            <div
              v-else
              class="w-55 h-55 flex items-center justify-center bg-gray-50 rounded-lg"
            >
              <UIcon
                name="i-lucide-loader-circle"
                class="animate-spin text-3xl text-gray-300"
              />
            </div>
          </div>

          <!-- Copiar código -->
          <div class="w-full">
            <p class="text-xs text-gray-500 mb-1 font-medium">
              PIX Copia e Cola
            </p>
            <div class="flex gap-2">
              <input
                readonly
                :value="dados.qrCode"
                class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono bg-gray-50 text-gray-600 truncate"
              />
              <UButton
                :color="copiado ? 'success' : 'neutral'"
                variant="soft"
                :icon="copiado ? 'i-lucide-check' : 'i-lucide-copy'"
                @click="copiarPix"
              >
                {{ copiado ? "Copiado!" : "Copiar" }}
              </UButton>
            </div>
          </div>

          <!-- Instruções -->
          <ol class="text-sm text-gray-500 space-y-1 self-start">
            <li>1. Abra o app do seu banco</li>
            <li>2. Escolha <strong>Pagar via PIX</strong></li>
            <li>3. Escaneie o QR code ou cole o código</li>
            <li>4. Esta página atualizará automaticamente ✓</li>
          </ol>

          <div class="flex items-center gap-2 text-xs text-gray-400">
            <UIcon name="i-lucide-loader-circle" class="animate-spin" />
            Aguardando confirmação do pagamento...
          </div>
        </div>

        <template #footer>
          <div class="flex justify-center">
            <UButton variant="ghost" color="neutral" size="xs" to="/login">
              Pagar depois e acessar trial
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
