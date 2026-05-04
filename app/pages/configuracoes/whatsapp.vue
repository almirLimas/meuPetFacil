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

// ── Template de mensagem ─────────────────────────────────────────────────────
const { apiFetch } = useApi();
const toast = useToast();

const TEMPLATE_PADRAO =
  "Olá, {nome}! 🐾 Seu agendamento para {pet} foi confirmado.\nServiço: {servico}\nData: {data} às {hora}\nAté lá! 😊";

const TEMPLATE_AVALIACAO_PADRAO =
  "Olá, {nome}! 🐾 Esperamos que {pet} tenha adorado o serviço!\n\nPoderia avaliar o atendimento? Leva menos de 1 minuto 😊\n{link}";

const mensagem = ref(TEMPLATE_PADRAO);
const mensagemAvaliacao = ref(TEMPLATE_AVALIACAO_PADRAO);
const salvandoMensagem = ref(false);
const salvandoAvaliacao = ref(false);

async function carregarMensagem() {
  try {
    const data = await apiFetch<{
      mensagem: string;
      mensagemAvaliacao: string;
    }>("/auth/whatsapp-config");
    mensagem.value = data.mensagem;
    mensagemAvaliacao.value = data.mensagemAvaliacao;
  } catch {
    // usa padrão
  }
}

async function salvarMensagem() {
  salvandoMensagem.value = true;
  try {
    await apiFetch("/auth/whatsapp-config", {
      method: "PATCH",
      body: { mensagem: mensagem.value },
    });
    toast.add({ title: "Mensagem salva!", color: "green" });
  } catch {
    toast.add({ title: "Erro ao salvar mensagem.", color: "red" });
  } finally {
    salvandoMensagem.value = false;
  }
}

async function salvarMensagemAvaliacao() {
  salvandoAvaliacao.value = true;
  try {
    await apiFetch("/auth/whatsapp-config", {
      method: "PATCH",
      body: { mensagemAvaliacao: mensagemAvaliacao.value },
    });
    toast.add({ title: "Mensagem de avaliação salva!", color: "green" });
  } catch {
    toast.add({ title: "Erro ao salvar mensagem.", color: "red" });
  } finally {
    salvandoAvaliacao.value = false;
  }
}

const previewMensagem = computed(() =>
  mensagem.value
    .replaceAll("{nome}", "João Silva")
    .replaceAll("{pet}", "Bolinha")
    .replaceAll("{servico}", "Banho e Tosa")
    .replaceAll("{data}", "10/05/2026")
    .replaceAll("{hora}", "14:00"),
);

const previewAvaliacao = computed(() =>
  mensagemAvaliacao.value
    .replaceAll("{nome}", "João Silva")
    .replaceAll("{pet}", "Bolinha")
    .replaceAll("{link}", "https://app.aninpet.com.br/avaliar/xxx"),
);

// Carrega o status atual ao montar a página (somente no plano Plus)
onMounted(() => {
  if (isPlus.value) {
    void atualizarStatus();
    void carregarMensagem();
  }
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
  <div class="px-4 py-8 space-y-6">
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

      <!-- Templates de mensagens lado a lado -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <!-- Mensagem de agendamento -->
        <UCard class="flex flex-col">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-message-square-text"
                class="text-green-500"
              />
              <p class="font-semibold text-sm">Confirmação de agendamento</p>
            </div>
          </template>

          <div class="space-y-3 flex-1">
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Enviada quando um agendamento é criado.
            </p>
            <div class="flex flex-wrap gap-1">
              <UBadge
                v-for="v in [
                  '{nome}',
                  '{pet}',
                  '{servico}',
                  '{data}',
                  '{hora}',
                ]"
                :key="v"
                color="neutral"
                variant="soft"
                class="font-mono text-xs cursor-pointer select-all"
                >{{ v }}</UBadge
              >
            </div>

            <UTextarea
              v-model="mensagem"
              :rows="5"
              placeholder="Digite a mensagem..."
              class="w-full font-mono text-sm"
            />

            <div
              v-if="previewMensagem"
              class="bg-green-50 dark:bg-green-950/30 rounded-xl p-3 border border-green-200 dark:border-green-800"
            >
              <p
                class="text-xs font-semibold text-green-700 dark:text-green-300 mb-1"
              >
                Prévia:
              </p>
              <p
                class="text-sm text-green-800 dark:text-green-200 whitespace-pre-line"
              >
                {{ previewMensagem }}
              </p>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton
                color="primary"
                :loading="salvandoMensagem"
                icon="i-lucide-save"
                @click="salvarMensagem"
              >
                Salvar
              </UButton>
            </div>
          </template>
        </UCard>

        <!-- Mensagem de avaliação -->
        <UCard class="flex flex-col">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-star" class="text-yellow-500" />
              <p class="font-semibold text-sm">Pesquisa de satisfação</p>
            </div>
          </template>

          <div class="space-y-3 flex-1">
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Enviada quando um agendamento é concluído.
            </p>
            <div class="flex flex-wrap gap-1">
              <UBadge
                v-for="v in ['{nome}', '{pet}', '{link}']"
                :key="v"
                color="neutral"
                variant="soft"
                class="font-mono text-xs cursor-pointer select-all"
                >{{ v }}</UBadge
              >
            </div>

            <UTextarea
              v-model="mensagemAvaliacao"
              :rows="5"
              placeholder="Digite a mensagem..."
              class="w-full font-mono text-sm"
            />

            <div
              v-if="previewAvaliacao"
              class="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl p-3 border border-yellow-200 dark:border-yellow-800"
            >
              <p
                class="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-1"
              >
                Prévia:
              </p>
              <p
                class="text-sm text-yellow-800 dark:text-yellow-200 whitespace-pre-line"
              >
                {{ previewAvaliacao }}
              </p>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton
                color="primary"
                :loading="salvandoAvaliacao"
                icon="i-lucide-save"
                @click="salvarMensagemAvaliacao"
              >
                Salvar
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

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
