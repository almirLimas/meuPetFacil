<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({ layout: "default" });
useBreadcrumb().set([{ label: "Configurações" }, { label: "WhatsApp" }]);

const authStore = useAuthStore();
const isPlus = computed(() => authStore.usuario?.plano === "plus");

const {
  status,
  qrDataUrl,
  carregando,
  erro,
  atualizarStatus,
  conectar,
  desconectar,
} = useWhatsapp();

// Carrega o status atual ao montar a página (somente no plano Plus)
onMounted(() => {
  if (isPlus.value) void atualizarStatus();
});

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    desconectado: "Desconectado",
    conectando: "Conectando...",
    aguardando_scan: "Aguardando scan do QR code",
    conectado: "Conectado",
  };
  return map[status.value] ?? status.value;
});

const statusColor = computed(
  (): "error" | "warning" | "success" | "neutral" => {
    const map: Record<string, "error" | "warning" | "success" | "neutral"> = {
      desconectado: "error",
      conectando: "warning",
      aguardando_scan: "warning",
      conectado: "success",
    };
    return map[status.value] ?? "neutral";
  },
);
</script>

<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-1">WhatsApp</h1>
    <p class="text-neutral-500 dark:text-neutral-400 mb-6 text-sm">
      Conecte o número de WhatsApp da sua petshop para enviar lembretes e
      mensagens de recuperação de clientes.
    </p>

    <!-- Upgrade card para plano Básico -->
    <template v-if="!isPlus">
      <UCard
        class="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20"
      >
        <div class="flex flex-col items-center gap-4 py-6 text-center">
          <div
            class="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center"
          >
            <UIcon name="i-lucide-lock" class="size-7 text-orange-500" />
          </div>
          <div>
            <p class="font-bold text-gray-900 dark:text-white text-lg">
              Recurso exclusivo do plano Plus
            </p>
            <p
              class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto"
            >
              A integração com WhatsApp — lembretes automáticos, recuperação de
              clientes e envio de mensagens — está disponível apenas no plano
              <strong>Plus</strong>.
            </p>
          </div>
          <UButton
            color="primary"
            size="md"
            icon="i-lucide-arrow-right"
            trailing
            to="/configuracoes/assinatura"
          >
            Fazer upgrade para o Plus
          </UButton>
          <p class="text-xs text-gray-400">
            R$ 109/mês · Cancele quando quiser
          </p>
        </div>
      </UCard>
    </template>

    <!-- Conteúdo exclusivo para plano Plus -->
    <template v-else>
      <!-- Card de status -->
      <UCard class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-smartphone" class="text-2xl text-green-500" />
            <div>
              <p class="font-semibold text-sm">Status da conexão</p>
              <UBadge :color="statusColor" variant="soft">
                {{ statusLabel }}
              </UBadge>
            </div>
          </div>
          <div class="flex gap-2">
            <UButton
              v-if="status === 'desconectado'"
              color="primary"
              :loading="carregando"
              icon="i-lucide-link"
              @click="conectar"
            >
              Conectar
            </UButton>
            <UButton
              v-else-if="status === 'conectado'"
              color="error"
              variant="soft"
              :loading="carregando"
              icon="i-lucide-unlink"
              @click="desconectar"
            >
              Desconectar
            </UButton>
            <UButton
              v-else
              color="neutral"
              variant="soft"
              :loading="true"
              disabled
            >
              {{
                status === "aguardando_scan"
                  ? "Aguardando scan..."
                  : "Conectando..."
              }}
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- QR Code -->
      <UCard v-if="status === 'aguardando_scan'" class="mb-6">
        <div class="flex flex-col items-center gap-4 py-4">
          <p class="font-semibold text-center">
            Escaneie o QR code com o WhatsApp do seu celular
          </p>
          <ol
            class="text-sm text-neutral-500 dark:text-neutral-400 space-y-1 self-start"
          >
            <li>1. Abra o WhatsApp no seu celular</li>
            <li>2. Toque em <strong>Aparelhos conectados</strong></li>
            <li>3. Toque em <strong>Conectar um aparelho</strong></li>
            <li>4. Aponte a câmera para o QR code abaixo</li>
          </ol>

          <div
            v-if="qrDataUrl"
            class="border-4 border-green-400 rounded-xl p-2 bg-white"
          >
            <img
              :src="qrDataUrl"
              alt="QR code WhatsApp"
              width="256"
              height="256"
            />
          </div>
          <div v-else class="flex items-center gap-2 text-neutral-400">
            <UIcon name="i-lucide-loader-circle" class="animate-spin" />
            Gerando QR code...
          </div>

          <p class="text-xs text-neutral-400 text-center">
            O QR code atualiza automaticamente a cada 3 segundos.
            <br />
            Após o scan, a página atualizará automaticamente.
          </p>
        </div>
      </UCard>

      <!-- Conectado -->
      <UCard v-if="status === 'conectado'" class="mb-6">
        <div class="flex items-center gap-3 text-green-600 dark:text-green-400">
          <UIcon name="i-lucide-check-circle-2" class="text-2xl" />
          <div>
            <p class="font-semibold">WhatsApp conectado!</p>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              Sua petshop já pode enviar mensagens automáticas para os clientes.
            </p>
          </div>
        </div>
      </UCard>

      <!-- Erro -->
      <UAlert
        v-if="erro"
        color="error"
        variant="soft"
        :title="erro"
        class="mb-4"
      />

      <!-- Dicas -->
      <UCard class="bg-blue-50 dark:bg-blue-950/30">
        <p class="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
          Como funciona?
        </p>
        <ul
          class="text-sm text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside"
        >
          <li>
            Cada petshop conecta <strong>seu próprio número</strong> de WhatsApp
          </li>
          <li>
            As mensagens saem com o número da petshop — não um número genérico
          </li>
          <li>A sessão fica ativa enquanto o servidor estiver rodando</li>
          <li>Se desconectar, basta escanear o QR code novamente</li>
        </ul>
      </UCard>
    </template>
  </div>
</template>
