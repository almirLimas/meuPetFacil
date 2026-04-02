<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { PLANOS } from "~/types/usuario";

definePageMeta({ layout: "default" });

const authStore = useAuthStore();
const { obterStatus, renovarAssinatura } = usePagamento();
const toast = useToast();

const carregando = ref(true);
const renovando = ref(false);
const planoSelecionado = ref<"basico" | "plus">("basico");

const statusInfo = ref<{
  assinaturaStatus: string;
  trialExpiraEm: string | null;
  plano: string;
} | null>(null);

onMounted(async () => {
  try {
    statusInfo.value = await obterStatus();
  } catch {
    // fallback para dados do store
    statusInfo.value = {
      assinaturaStatus: authStore.usuario?.assinaturaStatus ?? "trial",
      trialExpiraEm: authStore.usuario?.trialExpiraEm ?? null,
      plano: authStore.usuario?.plano ?? "basico",
    };
  } finally {
    planoSelecionado.value =
      (statusInfo.value?.plano as "basico" | "plus") ?? "basico";
    carregando.value = false;
  }
});

const planoAtual = computed(() =>
  statusInfo.value?.plano === "plus" ? PLANOS.plus : PLANOS.basico,
);

const status = computed(() => statusInfo.value?.assinaturaStatus ?? "trial");

const diasRestantes = computed(() => {
  const expira =
    statusInfo.value?.trialExpiraEm ?? authStore.usuario?.trialExpiraEm;
  if (!expira) return null;
  const diff = new Date(expira).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

const statusConfig = computed(() => {
  switch (status.value) {
    case "ativa":
      return {
        label: "Assinatura Ativa",
        desc: `Plano ${planoAtual.value.nome} — R$ ${planoAtual.value.preco}/mês`,
        icon: "i-lucide-circle-check",
        badgeColor:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        cardColor:
          "bg-green-50 border border-green-200 dark:bg-green-900/10 dark:border-green-800",
      };
    case "trial": {
      const dias = diasRestantes.value;
      let trialDesc = "Período de avaliação";
      if (dias === 0) trialDesc = "Seu período gratuito encerrou";
      else if (dias === 1) trialDesc = "Seu teste expira hoje!";
      else if (dias !== null) trialDesc = `Seu teste expira em ${dias} dias`;
      return {
        label: dias === 0 ? "Trial Expirado" : "Trial Gratuito",
        desc: trialDesc,
        icon: dias === 0 ? "i-lucide-clock-alert" : "i-lucide-clock",
        badgeColor:
          diasRestantes.value !== null && diasRestantes.value <= 3
            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        cardColor:
          diasRestantes.value !== null && diasRestantes.value <= 3
            ? "bg-orange-50 border border-orange-200 dark:bg-orange-900/10 dark:border-orange-800"
            : "bg-blue-50 border border-blue-200 dark:bg-blue-900/10 dark:border-blue-800",
      };
    }
    case "suspensa":
      return {
        label: "Assinatura Suspensa",
        desc: "Renove para continuar usando o sistema",
        icon: "i-lucide-ban",
        badgeColor:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        cardColor:
          "bg-red-50 border border-red-200 dark:bg-red-900/10 dark:border-red-800",
      };
    case "cancelada":
      return {
        label: "Assinatura Cancelada",
        desc: "Entre em contato com o suporte para reativar",
        icon: "i-lucide-x-circle",
        badgeColor:
          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        cardColor:
          "bg-gray-50 border border-gray-200 dark:bg-gray-900/10 dark:border-gray-700",
      };
    case "pendente":
      return {
        label: "Pagamento Pendente",
        desc: "Aguardando confirmação do pagamento",
        icon: "i-lucide-hourglass",
        badgeColor:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        cardColor:
          "bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800",
      };
    default:
      return {
        label: "Status desconhecido",
        desc: "",
        icon: "i-lucide-help-circle",
        badgeColor: "bg-gray-100 text-gray-600",
        cardColor: "bg-gray-50 border border-gray-200",
      };
  }
});

const podeAssinar = computed(() =>
  ["trial", "suspensa", "cancelada"].includes(status.value),
);

async function handleRenovar() {
  renovando.value = true;
  try {
    const resultado = await renovarAssinatura(planoSelecionado.value);
    globalThis.location.href = resultado.url;
  } catch {
    toast.add({
      title: "Erro ao iniciar pagamento",
      description: "Tente novamente ou fale com o suporte.",
      color: "error",
    });
    renovando.value = false;
  }
}

function selecionarPlano(plano: "basico" | "plus") {
  if (!podeAssinar.value) return;
  planoSelecionado.value = plano;
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8 space-y-6">
    <!-- Cabeçalho -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Minha Assinatura
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Gerencie seu plano e acompanhe o status da sua assinatura.
      </p>
    </div>

    <!-- Skeleton -->
    <template v-if="carregando">
      <div class="space-y-4">
        <USkeleton class="h-24 rounded-2xl w-full" />
        <USkeleton class="h-48 rounded-2xl w-full" />
      </div>
    </template>

    <template v-else>
      <!-- Card de status -->
      <div
        class="rounded-2xl p-5 flex items-start gap-4"
        :class="statusConfig.cardColor"
      >
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          :class="statusConfig.badgeColor"
        >
          <UIcon :name="statusConfig.icon" class="size-5" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900 dark:text-white">
            {{ statusConfig.label }}
          </p>
          <p
            class="text-sm mt-0.5"
            :class="
              statusConfig.badgeColor.includes('green')
                ? 'text-green-700 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400'
            "
          >
            {{ statusConfig.desc }}
          </p>
        </div>
        <UButton
          v-if="podeAssinar"
          :loading="renovando"
          color="primary"
          size="sm"
          class="shrink-0 font-semibold"
          @click="handleRenovar"
        >
          Assinar agora
        </UButton>
      </div>

      <!-- Planos -->
      <div
        class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-6 space-y-4"
      >
        <h2 class="font-semibold text-gray-800 dark:text-gray-100 text-base">
          {{ podeAssinar ? "Escolha seu plano" : "Planos disponíveis" }}
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Básico -->
          <div
            class="rounded-xl border-2 p-4 flex flex-col gap-3 transition-colors"
            :class="
              podeAssinar
                ? planoSelecionado === 'basico'
                  ? 'border-sky-500 bg-sky-500/5 cursor-pointer'
                  : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 cursor-pointer hover:border-sky-300'
                : statusInfo?.plano === 'basico'
                  ? 'border-sky-500 bg-sky-500/5'
                  : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900'
            "
            @click="selecionarPlano('basico')"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-900 dark:text-white text-base">{{
                PLANOS.basico.nome
              }}</span>
              <UBadge
                v-if="podeAssinar && planoSelecionado === 'basico'"
                color="primary"
                variant="soft"
                size="xs"
              >
                Selecionado
              </UBadge>
              <UBadge
                v-else-if="
                  !podeAssinar &&
                  statusInfo?.plano === 'basico' &&
                  status === 'ativa'
                "
                color="primary"
                variant="soft"
                size="xs"
              >
                Seu plano
              </UBadge>
            </div>
            <p class="text-2xl font-extrabold text-gray-900 dark:text-white">
              R$ {{ PLANOS.basico.preco }}
              <span class="text-sm font-normal text-gray-500">/mês</span>
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ PLANOS.basico.descricao }}
            </p>
            <ul class="space-y-1.5 mt-1">
              <li
                v-for="modulo in PLANOS.basico.modulos"
                :key="modulo"
                class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"
              >
                <UIcon
                  name="i-lucide-check"
                  class="size-3.5 text-sky-500 shrink-0"
                />
                {{ modulo.charAt(0).toUpperCase() + modulo.slice(1) }}
              </li>
            </ul>
          </div>

          <!-- Plus -->
          <div
            class="rounded-xl border-2 p-4 flex flex-col gap-3 transition-colors relative overflow-hidden"
            :class="
              podeAssinar
                ? planoSelecionado === 'plus'
                  ? 'border-orange-500 bg-orange-500/5 cursor-pointer'
                  : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 cursor-pointer hover:border-orange-300'
                : statusInfo?.plano === 'plus'
                  ? 'border-orange-500 bg-orange-500/5'
                  : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900'
            "
            @click="selecionarPlano('plus')"
          >
            <div
              class="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white"
            >
              RECOMENDADO
            </div>
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-900 dark:text-white text-base">{{
                PLANOS.plus.nome
              }}</span>
              <UBadge
                v-if="podeAssinar && planoSelecionado === 'plus'"
                color="secondary"
                variant="soft"
                size="xs"
              >
                Selecionado
              </UBadge>
              <UBadge
                v-else-if="
                  !podeAssinar &&
                  statusInfo?.plano === 'plus' &&
                  status === 'ativa'
                "
                color="secondary"
                variant="soft"
                size="xs"
              >
                Seu plano
              </UBadge>
            </div>
            <p class="text-2xl font-extrabold text-gray-900 dark:text-white">
              R$ {{ PLANOS.plus.preco }}
              <span class="text-sm font-normal text-gray-500">/mês</span>
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ PLANOS.plus.descricao }}
            </p>
            <ul class="space-y-1.5 mt-1">
              <li
                v-for="modulo in PLANOS.plus.modulos"
                :key="modulo"
                class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"
              >
                <UIcon
                  name="i-lucide-check"
                  class="size-3.5 text-orange-500 shrink-0"
                />
                {{ modulo.charAt(0).toUpperCase() + modulo.slice(1) }}
              </li>
            </ul>
          </div>
        </div>

        <!-- CTA -->
        <div
          v-if="podeAssinar"
          class="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between"
        >
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Ao assinar, você será redirecionado ao Mercado Pago para concluir o
            pagamento.
          </p>
          <UButton
            :loading="renovando"
            size="md"
            class="font-semibold rounded-xl text-white shrink-0"
            style="background-color: #f07030"
            @click="handleRenovar"
          >
            Assinar plano {{ planoSelecionado === "plus" ? "Plus" : "Básico" }}
          </UButton>
        </div>
        <div v-else-if="status === 'ativa'" class="pt-2">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Para trocar de plano ou cancelar sua assinatura, entre em contato
            com o suporte.
          </p>
          <a
            href="https://wa.me/5511966389057?text=Olá!%20Quero%20alterar%20meu%20plano%20AninPet."
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 mt-2"
          >
            <UIcon name="i-lucide-headset" class="size-4" />
            Falar com suporte via WhatsApp
          </a>
        </div>
      </div>
    </template>
  </div>
</template>
