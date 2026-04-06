<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
useBreadcrumb().set([{ label: "Relatórios" }]);

definePageMeta({ layout: "default" });

const authStore = useAuthStore();
const isPlus = computed(() => authStore.usuario?.plano === "plus");

const {
  resumo,
  clientesNaoVoltaram,
  servicosPopulares,
  loading,
  loadingClientes,
  fetchResumo,
  fetchClientesNaoVoltaram,
  fetchServicosPopulares,
} = useRelatorios();

// ── Filtros ──────────────────────────────────────────────────────────────────

const mesAtual = new Date().toISOString().substring(0, 7);
const mesFiltro = ref(mesAtual);
const diasFiltro = ref("30");

const mesesOpcoes = computed(() => {
  const opcoes = [];
  const hoje = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const valor = d.toISOString().substring(0, 7);
    const label = d.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    opcoes.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value: valor,
    });
  }
  return opcoes;
});

const diasOpcoes = [
  { label: "7d", value: "7", full: "7 dias" },
  { label: "15d", value: "15", full: "15 dias" },
  { label: "30d", value: "30", full: "30 dias" },
  { label: "45d", value: "45", full: "45 dias" },
  { label: "60d", value: "60", full: "60 dias" },
  { label: "90d", value: "90", full: "90 dias" },
];

// ── Carregamento ─────────────────────────────────────────────────────────────

const carregar = async () => {
  await Promise.all([
    fetchResumo(mesFiltro.value),
    fetchServicosPopulares(mesFiltro.value),
  ]);
};

const carregarClientesNaoVoltaram = async () => {
  await fetchClientesNaoVoltaram(Number(diasFiltro.value));
};

onMounted(async () => {
  await carregar();
  await carregarClientesNaoVoltaram();
});

watch(mesFiltro, carregar);
watch(diasFiltro, carregarClientesNaoVoltaram);

// ── Painel "Recuperar Clientes" ───────────────────────────────────────────────

const mostrarPainelRecuperacao = ref(false);

// ── Resultado WhatsApp via toast ─────────────────────────────────────────────
const toast = useToast();

function mostrarResultado(sucesso: boolean, titulo: string, descricao: string) {
  toast.add({
    title: titulo,
    description: descricao,
    color: sucesso ? "success" : "error",
    icon: sucesso ? "i-lucide-check-circle" : "i-lucide-x-circle",
    duration: 5000,
  });
}

const recuperarTodos = () => {
  mostrarPainelRecuperacao.value = true;
};

// ── Formatadores ─────────────────────────────────────────────────────────────

const formatarMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatarData = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const corUrgencia = (dias: number) => {
  if (dias > 60) return "text-red-500";
  if (dias > 30) return "text-orange-500";
  return "text-yellow-500";
};

const badgeUrgencia = (dias: number): "error" | "warning" | "neutral" => {
  if (dias > 60) return "error";
  if (dias > 30) return "warning";
  return "neutral";
};

const taxaCorLabel = computed(() => {
  const t = resumo.value?.taxaRetorno ?? 0;
  if (t >= 70) return "text-green-600 dark:text-green-400";
  if (t >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
});

const totalReceitaEstimada = computed(() =>
  servicosPopulares.value.reduce((acc, s) => acc + s.receitaEstimada, 0),
);
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- ═══ Cabeçalho ═══════════════════════════════════════════════════════ -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Relatórios & Oportunidades
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Transforme dados em ações para crescer seu negócio
        </p>
      </div>

      <USelect
        v-model="mesFiltro"
        :options="mesesOpcoes"
        value-key="value"
        label-key="label"
        class="w-52"
      />
    </div>

    <!-- ═══ Cards de Insight ═══════════════════════════════════════════════ -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <USkeleton v-for="i in 4" :key="i" class="h-32 rounded-xl" />
    </div>

    <div
      v-else-if="resumo"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <!-- Clientes ativos -->
      <UCard class="border border-neutral-200 dark:border-neutral-700">
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs font-medium text-neutral-500 uppercase tracking-wide"
            >
              Clientes ativos
            </p>
            <p class="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {{ resumo.totalClientesAtivos }}
            </p>
            <p class="text-sm text-green-600 mt-1 font-medium">
              +{{ resumo.novosClientes }} novos esse mês
            </p>
          </div>
          <div class="p-2.5 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <UIcon name="i-lucide-users" class="size-5 text-blue-500" />
          </div>
        </div>
      </UCard>

      <!-- Clientes que não voltaram (card de oportunidade) -->
      <UCard
        class="border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950 cursor-pointer hover:shadow-md transition-shadow"
        @click="mostrarPainelRecuperacao = true"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs font-medium text-orange-600 uppercase tracking-wide"
            >
              🚨 Não voltaram (30d)
            </p>
            <p
              class="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-1"
            >
              {{ resumo.clientesNaoVoltaram }}
            </p>
            <UButton
              size="xs"
              color="warning"
              variant="soft"
              icon="i-lucide-message-circle"
              class="mt-2"
              @click.stop="recuperarTodos"
            >
              Recuperar clientes
            </UButton>
          </div>
          <div class="p-2.5 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <UIcon name="i-lucide-user-x" class="size-5 text-orange-500" />
          </div>
        </div>
      </UCard>

      <!-- Taxa de retorno -->
      <UCard class="border border-neutral-200 dark:border-neutral-700">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p
              class="text-xs font-medium text-neutral-500 uppercase tracking-wide"
            >
              Taxa de retorno
            </p>
            <p class="text-3xl font-bold mt-1" :class="taxaCorLabel">
              {{ resumo.taxaRetorno }}%
            </p>
            <div
              class="mt-2 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full"
            >
              <div
                class="h-2 rounded-full transition-all"
                :class="
                  resumo.taxaRetorno >= 70
                    ? 'bg-green-500'
                    : resumo.taxaRetorno >= 40
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                "
                :style="{ width: `${Math.min(resumo.taxaRetorno, 100)}%` }"
              />
            </div>
            <p class="text-xs text-neutral-400 mt-1">
              {{ resumo.clientesRetornaram }} de
              {{ resumo.totalClientesAtivos }} voltaram
            </p>
          </div>
          <div class="p-2.5 bg-green-50 dark:bg-green-950 rounded-lg ml-3">
            <UIcon name="i-lucide-repeat" class="size-5 text-green-500" />
          </div>
        </div>
      </UCard>

      <!-- Faturamento -->
      <UCard class="border border-neutral-200 dark:border-neutral-700">
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs font-medium text-neutral-500 uppercase tracking-wide"
            >
              Faturamento
            </p>
            <p class="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
              {{ formatarMoeda(resumo.faturamento) }}
            </p>
            <p class="text-sm text-neutral-500 mt-1">
              {{ resumo.agendamentos.concluidos }} atendimentos concluídos
            </p>
          </div>
          <div class="p-2.5 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
            <UIcon name="i-lucide-banknote" class="size-5 text-emerald-500" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Cards de agendamentos (linha secundária) -->
    <div
      v-if="resumo && !loading"
      class="grid grid-cols-1 sm:grid-cols-4 gap-3"
    >
      <div
        class="bg-white dark:bg-neutral-800 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700 text-center"
      >
        <p class="text-2xl font-bold text-neutral-800 dark:text-white">
          {{ resumo.agendamentos.total }}
        </p>
        <p class="text-xs text-neutral-500 mt-0.5">Agendamentos</p>
      </div>
      <div
        class="bg-white dark:bg-neutral-800 rounded-lg p-3 border border-green-200 dark:border-green-800 text-center"
      >
        <p class="text-2xl font-bold text-green-600">
          {{ resumo.agendamentos.concluidos }}
        </p>
        <p class="text-xs text-neutral-500 mt-0.5">Concluídos</p>
      </div>
      <div
        class="bg-white dark:bg-neutral-800 rounded-lg p-3 border border-red-200 dark:border-red-800 text-center"
      >
        <p class="text-2xl font-bold text-red-500">
          {{ resumo.agendamentos.cancelados }}
        </p>
        <p class="text-xs text-neutral-500 mt-0.5">Cancelados</p>
      </div>
      <div
        class="bg-white dark:bg-neutral-800 rounded-lg p-3 border border-orange-200 dark:border-orange-800 text-center"
      >
        <p class="text-2xl font-bold text-orange-500">
          {{ resumo.agendamentos.naoCompareceu }}
        </p>
        <p class="text-xs text-neutral-500 mt-0.5">Não compareceu</p>
      </div>
    </div>

    <!-- ═══ Painel: Clientes para recuperar ════════════════════════════════ -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-user-x" class="size-5 text-orange-500" />
            <h2 class="font-semibold text-neutral-900 dark:text-white">
              Clientes para recuperar
            </h2>
            <UBadge v-if="clientesNaoVoltaram" color="warning" variant="soft">
              {{ clientesNaoVoltaram.total }}
            </UBadge>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm text-neutral-500">Sem visita há mais de:</span>
            <div
              class="flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden"
            >
              <button
                v-for="opt in diasOpcoes"
                :key="opt.value"
                type="button"
                class="px-2.5 py-1 text-xs font-medium border-r border-neutral-200 dark:border-neutral-700 last:border-r-0 transition-colors"
                :class="
                  diasFiltro === opt.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-orange-50 dark:hover:bg-orange-950'
                "
                :title="opt.full"
                @click="diasFiltro = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <p class="text-sm text-neutral-500 mt-1">
          💡 <strong>Dica:</strong> Um único cliente recuperado pode valer R$
          150–300/mês em atendimentos recorrentes.
          <span v-if="isPlus" class="text-green-600 font-medium"
            >Os lembretes por e-mail são enviados automaticamente todo dia às
            10h para clientes sem visita há mais de 30 dias.</span
          >
          <span v-else class="text-orange-500 font-medium"
            >Assine o plano Plus para ativar lembretes automáticos por
            e-mail.</span
          >
        </p>
      </template>

      <div v-if="loadingClientes" class="space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
      </div>

      <div
        v-else-if="clientesNaoVoltaram && clientesNaoVoltaram.clientes.length"
        class="divide-y divide-neutral-100 dark:divide-neutral-700"
      >
        <div
          v-for="cliente in clientesNaoVoltaram.clientes"
          :key="cliente.id"
          class="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >
          <!-- Info do cliente -->
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style="background-color: #e85a8a"
            >
              {{ cliente.nome.slice(0, 2).toUpperCase() }}
            </div>
            <div>
              <p class="font-medium text-neutral-900 dark:text-white text-sm">
                {{ cliente.nome }}
              </p>
              <p class="text-xs text-neutral-500">
                {{ cliente.servicos }} ·
                <span
                  class="font-medium"
                  :class="corUrgencia(cliente.diasSemVoltar)"
                >
                  {{ cliente.diasSemVoltar }} dias sem voltar
                </span>
              </p>
              <p class="text-xs text-neutral-400">
                Última visita: {{ formatarData(cliente.ultimoAgendamento) }}
              </p>
            </div>
          </div>

          <!-- Ações -->
          <div class="flex items-center gap-2 ml-12 sm:ml-0">
            <UBadge
              :color="badgeUrgencia(cliente.diasSemVoltar)"
              variant="soft"
              size="sm"
            >
              {{
                cliente.diasSemVoltar > 60
                  ? "Urgente"
                  : cliente.diasSemVoltar > 30
                    ? "Atenção"
                    : "Monitorar"
              }}
            </UBadge>
            <UTooltip
              v-if="isPlus && cliente.email"
              text="Lembrete enviado automaticamente por e-mail"
            >
              <UBadge
                color="success"
                variant="soft"
                size="sm"
                icon="i-lucide-mail"
              >
                E-mail ativo
              </UBadge>
            </UTooltip>
            <UTooltip
              v-else-if="isPlus && !cliente.email"
              text="Cliente sem e-mail cadastrado"
            >
              <UBadge
                color="neutral"
                variant="soft"
                size="sm"
                icon="i-lucide-mail-x"
              >
                Sem e-mail
              </UBadge>
            </UTooltip>
          </div>
        </div>
      </div>

      <div v-else class="py-8 text-center text-neutral-400">
        <UIcon name="i-lucide-party-popper" class="size-10 mb-2" />
        <p class="text-sm">
          Todos os clientes voltaram nos últimos {{ diasFiltro }} dias! 🎉
        </p>
      </div>
    </UCard>

    <!-- ═══ Info: lembretes automáticos por e-mail (somente Plus) ══════════ -->
    <UCard
      v-if="isPlus"
      class="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"
    >
      <div class="flex items-start gap-3">
        <UIcon
          name="i-lucide-mail-check"
          class="size-6 text-green-500 shrink-0 mt-0.5"
        />
        <div>
          <p class="font-semibold text-green-800 dark:text-green-300">
            Lembretes automáticos por e-mail ativos
          </p>
          <p class="text-sm text-green-700 dark:text-green-400 mt-1">
            Todo dia às <strong>10h</strong> o sistema envia automaticamente um
            e-mail para cada cliente que não voltou há mais de 30 dias e possui
            e-mail cadastrado. Nenhuma ação necessária.
          </p>
        </div>
      </div>
    </UCard>

    <!-- ═══ Serviços mais populares ═════════════════════════════════════════ -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-bar-chart-2" class="size-5 text-blue-500" />
          <h2 class="font-semibold text-neutral-900 dark:text-white">
            Serviços mais populares
          </h2>
          <UBadge color="neutral" variant="soft" size="sm">
            {{ mesFiltro }}
          </UBadge>
        </div>
      </template>

      <div
        v-if="servicosPopulares.length === 0"
        class="py-8 text-center text-neutral-400"
      >
        <UIcon name="i-lucide-inbox" class="size-8 mb-2" />
        <p class="text-sm">Nenhum serviço concluído nesse mês ainda.</p>
      </div>

      <div v-else class="space-y-3">
        <!-- Barra de progresso por serviço -->
        <div
          v-for="(s, index) in servicosPopulares"
          :key="s.servicoId"
          class="flex items-center gap-3"
        >
          <span
            class="w-5 text-xs font-bold text-neutral-400 text-center shrink-0"
          >
            {{ index + 1 }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <span
                class="text-sm font-medium text-neutral-800 dark:text-white truncate"
              >
                {{ s.nome }}
              </span>
              <div class="flex items-center gap-3 shrink-0 ml-2">
                <span class="text-xs text-neutral-500"
                  >{{ s.quantidade }}x</span
                >
                <span class="text-xs font-semibold text-emerald-600">
                  {{ formatarMoeda(s.receitaEstimada) }}
                </span>
              </div>
            </div>
            <div class="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full">
              <div
                class="h-2 rounded-full bg-blue-500"
                :style="{
                  width: `${servicosPopulares[0] ? Math.round((s.quantidade / servicosPopulares[0].quantidade) * 100) : 0}%`,
                  opacity: 1 - index * 0.1,
                }"
              />
            </div>
          </div>
        </div>

        <div
          class="pt-2 border-t border-neutral-100 dark:border-neutral-700 flex justify-between text-sm"
        >
          <span class="text-neutral-500">Receita estimada total</span>
          <span class="font-bold text-emerald-600">{{
            formatarMoeda(totalReceitaEstimada)
          }}</span>
        </div>
      </div>
    </UCard>

    <!-- ═══ Dicas de crescimento ════════════════════════════════════════════ -->
    <UCard
      class="border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-lightbulb" class="size-5 text-yellow-500" />
          <h2 class="font-semibold text-neutral-900 dark:text-white">
            Dicas para aumentar seu faturamento
          </h2>
        </div>
      </template>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          class="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-blue-100 dark:border-neutral-700"
        >
          <p
            class="font-semibold text-sm text-neutral-800 dark:text-white mb-1"
          >
            📱 Mensagem pós-atendimento
          </p>
          <p class="text-xs text-neutral-500">
            Envie um WhatsApp 7 dias após cada atendimento perguntando como o
            pet está. Isso aumenta em 40% a chance de retorno.
          </p>
        </div>
        <div
          class="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-blue-100 dark:border-neutral-700"
        >
          <p
            class="font-semibold text-sm text-neutral-800 dark:text-white mb-1"
          >
            🔁 Pacote de fidelidade
          </p>
          <p class="text-xs text-neutral-500">
            Ofereça um pacote mensal (ex: 4 banhos por R$ 160 em vez de R$ 200).
            Clientes fidelizados trazem previsibilidade.
          </p>
        </div>
        <div
          class="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-blue-100 dark:border-neutral-700"
        >
          <p
            class="font-semibold text-sm text-neutral-800 dark:text-white mb-1"
          >
            🎂 Aniversário do pet
          </p>
          <p class="text-xs text-neutral-500">
            Envie um lembrete no aniversário do pet com desconto especial. É uma
            das ações com maior taxa de conversão.
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
