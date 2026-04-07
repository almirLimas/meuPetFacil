<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { PLANOS } from "~/types/usuario";

definePageMeta({ layout: "default" });

const authStore = useAuthStore();
const { obterStatus, renovarAssinatura, cancelarAssinatura, trocarPlano } =
  usePagamento();
const toast = useToast();

const carregando = ref(true);
const renovando = ref(false);
const cancelando = ref(false);
const confirmandoCancelamento = ref(false);
const planoSelecionado = ref<"basico" | "plus">("basico");

const statusInfo = ref<{
  assinaturaStatus: string;
  trialExpiraEm: string | null;
  plano: string;
  mpAssinaturaId: string | null;
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
      mpAssinaturaId: null,
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
    case "pendente": {
      const expirou = diasRestantes.value !== null && diasRestantes.value <= 0;
      const checkoutIniciado = !!statusInfo.value?.mpAssinaturaId;
      let pendenteDesc: string;
      if (!expirou) {
        pendenteDesc =
          "Seu checkout foi iniciado. Conclua o cadastro do cartão no Mercado Pago para garantir o acesso após os 14 dias.";
      } else if (checkoutIniciado) {
        pendenteDesc =
          'Você não concluiu o cadastro do cartão no Mercado Pago. Clique em "Assinar agora" para finalizar.';
      } else {
        pendenteDesc =
          "Seu período gratuito encerrou. Assine para continuar usando o sistema.";
      }
      return {
        label: expirou ? "Acesso encerrado" : "Cadastro de cartão pendente",
        desc: pendenteDesc,
        icon: expirou ? "i-lucide-credit-card" : "i-lucide-hourglass",
        badgeColor:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        cardColor:
          "bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800",
      };
    }
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
  ["trial", "pendente", "suspensa", "cancelada"].includes(status.value),
);

const podeTrocarPlano = computed(() =>
  ["ativa", "pendente"].includes(status.value),
);

// cards clicáveis em qualquer cenário que permita escolher plano
function selecionarPlano(plano: "basico" | "plus") {
  if (!podeAssinar.value && !podeTrocarPlano.value) return;
  planoSelecionado.value = plano;
}

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

const trocando = ref(false);

async function handleTrocarPlano() {
  trocando.value = true;
  try {
    await trocarPlano(planoSelecionado.value);
    if (statusInfo.value) statusInfo.value.plano = planoSelecionado.value;
    if (authStore.usuario) authStore.usuario.plano = planoSelecionado.value;
    toast.add({
      title: "Plano atualizado!",
      description: `Seu plano foi alterado para ${
        planoSelecionado.value === "plus" ? "Plus" : "Básico"
      } com sucesso.`,
      color: "success",
    });
  } catch {
    toast.add({
      title: "Erro ao trocar plano",
      description: "Tente novamente ou fale com o suporte.",
      color: "error",
    });
  } finally {
    trocando.value = false;
  }
}

async function handleCancelar() {
  cancelando.value = true;
  try {
    await cancelarAssinatura();
    if (statusInfo.value) statusInfo.value.assinaturaStatus = "cancelada";
    if (authStore.usuario) authStore.usuario.assinaturaStatus = "cancelada";
    confirmandoCancelamento.value = false;
    toast.add({
      title: "Assinatura cancelada",
      description: "Sua assinatura foi cancelada com sucesso.",
      color: "neutral",
    });
  } catch {
    toast.add({
      title: "Erro ao cancelar",
      description: "Tente novamente ou fale com o suporte.",
      color: "error",
    });
  } finally {
    cancelando.value = false;
  }
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
          <!-- Detalhes do plano ativo -->
          <div v-if="status === 'ativa'" class="mt-3 flex flex-wrap gap-3">
            <span
              class="inline-flex items-center gap-1.5 text-xs font-medium bg-white dark:bg-neutral-700 border border-green-200 dark:border-green-700 text-gray-700 dark:text-gray-200 rounded-full px-3 py-1"
            >
              <UIcon name="i-lucide-package" class="size-3.5 text-green-500" />
              Plano {{ planoAtual.nome }}
            </span>
            <span
              class="inline-flex items-center gap-1.5 text-xs font-medium bg-white dark:bg-neutral-700 border border-green-200 dark:border-green-700 text-gray-700 dark:text-gray-200 rounded-full px-3 py-1"
            >
              <UIcon
                name="i-lucide-credit-card"
                class="size-3.5 text-green-500"
              />
              R$ {{ planoAtual.preco }}/mês via Mercado Pago
            </span>
            <span
              class="inline-flex items-center gap-1.5 text-xs font-medium bg-white dark:bg-neutral-700 border border-green-200 dark:border-green-700 text-gray-700 dark:text-gray-200 rounded-full px-3 py-1"
            >
              <UIcon
                name="i-lucide-refresh-cw"
                class="size-3.5 text-green-500"
              />
              Renovação automática mensal
            </span>
          </div>
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
              podeAssinar || podeTrocarPlano
                ? planoSelecionado === 'basico'
                  ? 'border-sky-500 bg-sky-500/5 cursor-pointer'
                  : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 cursor-pointer hover:border-sky-300'
                : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900'
            "
            @click="selecionarPlano('basico')"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-900 dark:text-white text-base">{{
                PLANOS.basico.nome
              }}</span>
              <UBadge
                v-if="
                  podeTrocarPlano &&
                  statusInfo?.plano === 'basico' &&
                  planoSelecionado === 'basico'
                "
                color="primary"
                variant="soft"
                size="xs"
              >
                Seu plano
              </UBadge>
              <UBadge
                v-else-if="
                  (podeAssinar || podeTrocarPlano) &&
                  planoSelecionado === 'basico'
                "
                color="primary"
                variant="soft"
                size="xs"
              >
                Selecionado
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
              podeAssinar || podeTrocarPlano
                ? planoSelecionado === 'plus'
                  ? 'border-orange-500 bg-orange-500/5 cursor-pointer'
                  : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 cursor-pointer hover:border-orange-300'
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
                v-if="
                  podeTrocarPlano &&
                  statusInfo?.plano === 'plus' &&
                  planoSelecionado === 'plus'
                "
                color="secondary"
                variant="soft"
                size="xs"
              >
                Seu plano
              </UBadge>
              <UBadge
                v-else-if="
                  (podeAssinar || podeTrocarPlano) &&
                  planoSelecionado === 'plus'
                "
                color="secondary"
                variant="soft"
                size="xs"
              >
                Selecionado
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
        <div v-else-if="podeTrocarPlano" class="pt-2 space-y-3">
          <!-- Botão de troca de plano (só aparece quando selecionar plano diferente) -->
          <div
            v-if="planoSelecionado !== statusInfo?.plano"
            class="flex flex-col sm:flex-row gap-3 items-center justify-between"
          >
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Seu plano será atualizado imediatamente.
            </p>
            <UButton
              :loading="trocando"
              size="md"
              class="font-semibold rounded-xl text-white shrink-0"
              style="background-color: #f07030"
              @click="handleTrocarPlano"
            >
              Trocar para {{ planoSelecionado === "plus" ? "Plus" : "Básico" }}
            </UButton>
          </div>

          <!-- Cancelamento -->
          <div class="border-t border-gray-100 dark:border-neutral-700 pt-3">
            <template v-if="!confirmandoCancelamento">
              <button
                class="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 underline underline-offset-2 transition-colors"
                @click="confirmandoCancelamento = true"
              >
                Cancelar assinatura
              </button>
            </template>
            <template v-else>
              <div
                class="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 space-y-3"
              >
                <div class="flex items-start gap-3">
                  <UIcon
                    name="i-lucide-triangle-alert"
                    class="size-5 text-red-500 shrink-0 mt-0.5"
                  />
                  <div>
                    <p
                      class="text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Tem certeza que deseja cancelar?
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Seu acesso será encerrado imediatamente. Para reativar,
                      será necessário assinar novamente.
                    </p>
                  </div>
                </div>
                <div class="flex gap-2 justify-end">
                  <UButton
                    size="sm"
                    color="neutral"
                    variant="soft"
                    :disabled="cancelando"
                    @click="confirmandoCancelamento = false"
                  >
                    Manter assinatura
                  </UButton>
                  <UButton
                    size="sm"
                    color="error"
                    :loading="cancelando"
                    @click="handleCancelar"
                  >
                    Sim, cancelar
                  </UButton>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
