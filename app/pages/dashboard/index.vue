<script setup lang="ts">
import type { StatusAgendamento } from "~/types/agendamento";

useBreadcrumb().set([{ label: "Dashboard" }]);
import { useClienteStore } from "~/stores/cliente";

const { agendamentos, fetchByDate } = useAgenda();
const clienteStore = useClienteStore();
const { resumo, fetchResumoMes } = useFinanceiro();

const today = new Date().toISOString().slice(0, 10);

// Carrega agendamentos de hoje, clientes e resumo financeiro em paralelo
await Promise.all([
  fetchByDate(today),
  clienteStore.listar(),
  fetchResumoMes(),
]);

const proximosAgendamentos = computed(
  () =>
    agendamentos.value.filter(
      (a) => a.status === "Agendado" || a.status === "Confirmado",
    ).length,
);

const totalPets = computed(() =>
  clienteStore.clientes.reduce(
    (acc, c) => acc + (c._count?.pets ?? c.pets?.length ?? 0),
    0,
  ),
);

const stats = computed(() => [
  {
    lines: ["Clientes Ativos"],
    value: String(clienteStore.ativos.length),
    icon: "i-lucide-users",
    bgColor: "#d5f3f8",
    iconColor: "#1d9fb6",
  },
  {
    lines: ["Próximos", "Agendamentos"],
    value: String(proximosAgendamentos.value),
    icon: "i-lucide-calendar",
    bgColor: "#d5f3f8",
    iconColor: "#1d9fb6",
  },
  {
    lines: ["Pets Cadastrados"],
    value: String(totalPets.value),
    icon: "i-lucide-paw-print",
    bgColor: "#FFE0EC",
    iconColor: "#E85A8A",
  },
  {
    lines: ["Receitas do Mês"],
    value: resumo.value.receitas.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }),
    icon: "i-lucide-wallet",
    bgColor: "#E0FBF4",
    iconColor: "#1d9fb6",
  },
]);

const agendaItems = computed(() =>
  agendamentos.value
    .sort((a, b) => a.dataHora.localeCompare(b.dataHora))
    .map((a) => ({
      time: new Date(a.dataHora).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      service: a.servico.nome,
      pet: a.pet.nome,
      status: a.status as StatusAgendamento,
      passado:
        (a.status === "Agendado" || a.status === "Confirmado") &&
        new Date(a.dataHora) < new Date(),
    })),
);

const statusBadge: Record<
  StatusAgendamento | "AguardandoAcao",
  { label: string; bg: string; text: string }
> = {
  Agendado: { label: "Agendado", bg: "#d5f3f8", text: "#1d9fb6" },
  Confirmado: { label: "Confirmado", bg: "#d5f3f8", text: "#1d9fb6" },
  EmAtendimento: { label: "Em Atendimento", bg: "#FEF3C7", text: "#D97706" },
  Concluido: { label: "Concluído", bg: "#D1FAE5", text: "#10B981" },
  Cancelado: { label: "Cancelado", bg: "#F3F4F6", text: "#9CA3AF" },
  NaoCompareceu: { label: "Não Compareceu", bg: "#FEE2E2", text: "#EF4444" },
  AguardandoAcao: { label: "Aguardando Ação", bg: "#FFEDD5", text: "#EA580C" },
};

function resolverBadge(item: { status: StatusAgendamento; passado: boolean }) {
  if (item.passado) return statusBadge["AguardandoAcao"];
  return statusBadge[item.status];
}

const AVATAR_COLORS = [
  "#F9C5D1",
  "#B5E5C8",
  "#FFDAAA",
  "#AACFF5",
  "#D4C5F9",
  "#FFC9A9",
];

const ultimosClientes = computed(() =>
  [...clienteStore.clientes]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)
    .map((c, i) => ({
      id: c.id,
      nome: c.nome,
      petLabel:
        c.pets && c.pets.length > 0
          ? c.pets.map((p) => p.nome).join(", ")
          : "Sem pets",
      initials: c.nome.charAt(0).toUpperCase(),
      bg: AVATAR_COLORS[i % AVATAR_COLORS.length],
    })),
);

const servicosPopulares = [
  { label: "Banho", percent: 35, color: "#1d9fb6" },
  { label: "Tosa", percent: 25, color: "#f07030" },
  { label: "Consulta", percent: 20, color: "#10B981" },
  { label: "Hospedagem", percent: 20, color: "#9B6BB5" },
];

const { produtos, fetchProdutos } = useEstoque();
onMounted(() => fetchProdutos());

const iconeCategoria: Record<string, string> = {
  Alimento: "i-lucide-beef",
  Higiene: "i-lucide-droplets",
  Medicamento: "i-lucide-pill",
  Acessorio: "i-lucide-toy-brick",
  Vacina: "i-lucide-syringe",
  Outro: "i-lucide-package",
};

const estoqueResumo = computed(() =>
  produtos.value
    .filter((p) => p.ativo)
    .slice(0, 4)
    .map((p) => ({
      icon: iconeCategoria[p.categoria] ?? "i-lucide-package",
      label: p.nome,
      value: `${p.quantidadeAtual} ${p.unidade ?? ""}`,
      alerta: p.quantidadeAtual <= p.estoqueMinimo,
    })),
);

const totalAlertasEstoque = computed(
  () =>
    produtos.value.filter(
      (p) => p.ativo && p.quantidadeAtual <= p.estoqueMinimo,
    ).length,
);

const lucroMes = computed(() => resumo.value.receitas - resumo.value.despesas);
const metaReceita = 8000;
const percentReceita = computed(() =>
  Math.min(100, Math.round((resumo.value.receitas / metaReceita) * 100)),
);
</script>

<template>
  <!-- ── Row 1: Stats ── -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <DashboardStatCard
      v-for="stat in stats"
      :key="stat.lines[0]"
      :lines="stat.lines"
      :value="stat.value"
      :icon="stat.icon"
      :bg-color="stat.bgColor"
      :icon-color="stat.iconColor"
    />
  </div>

  <!-- ── Ações Rápidas ── -->
  <div class="flex flex-wrap gap-3">
    <NuxtLink
      to="/cadastro-cliente"
      class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
      style="background-color: #f07030"
    >
      <UIcon name="i-lucide-user-plus" class="size-4" />
      Novo Cliente
    </NuxtLink>
    <NuxtLink
      to="/agenda"
      class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
      style="background-color: #f07030"
    >
      <UIcon name="i-lucide-calendar-plus" class="size-4" />
      Novo Agendamento
    </NuxtLink>
  </div>

  <!-- ── Row 2: Agenda | Últimos Clientes ── -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Agenda de Hoje -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden flex flex-col"
    >
      <div
        class="flex items-center justify-between px-4 py-2.5"
        style="background-color: #1d9fb6"
      >
        <h3 class="text-white font-semibold text-sm">Agenda de Hoje</h3>
        <div class="flex gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-white/50"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-white/50"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-white/50"></span>
        </div>
      </div>
      <div class="p-4 flex flex-col gap-3 flex-1">
        <div
          v-for="item in agendaItems"
          :key="item.time + item.pet"
          class="flex items-center gap-3 text-sm"
        >
          <span
            class="text-gray-500 dark:text-gray-400 font-medium w-12 shrink-0"
            >{{ item.time }}</span
          >
          <span class="flex-1 text-gray-700 dark:text-gray-300 truncate">
            {{ item.service }} — {{ item.pet }}
          </span>
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
            :style="{
              backgroundColor: resolverBadge(item).bg,
              color: resolverBadge(item).text,
            }"
          >
            {{ resolverBadge(item).label }}
          </span>
        </div>
        <div class="flex justify-end mt-auto pt-2">
          <NuxtLink
            to="/agenda"
            class="text-white text-xs rounded-full px-4 py-1.5 transition-opacity hover:opacity-90"
            style="background-color: #f07030"
          >
            Ver Todas &rsaquo;
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Últimos Clientes Cadastrados -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden flex flex-col"
    >
      <div
        class="flex items-center justify-between px-4 py-2.5"
        style="background-color: #1d9fb6"
      >
        <h3 class="text-white font-semibold text-sm">
          Últimos Clientes Cadastrados
        </h3>
        <div class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-white/50"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-white/70"></span>
          <UIcon name="i-lucide-star" class="size-3 text-white" />
        </div>
      </div>
      <div class="p-4 flex flex-col gap-1 flex-1">
        <div
          v-for="c in ultimosClientes"
          :key="c.id"
          class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-neutral-700 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg px-1 transition-colors"
          @click="navigateTo(`/clientes/${c.id}`)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200 shrink-0"
              :style="{ backgroundColor: c.bg }"
            >
              {{ c.initials }}
            </div>
            <div class="flex flex-col leading-tight">
              <span class="text-sm text-gray-700 dark:text-gray-200">{{
                c.nome
              }}</span>
              <span class="text-xs text-gray-400">{{ c.petLabel }}</span>
            </div>
          </div>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-gray-400" />
        </div>
        <div class="flex justify-end mt-auto pt-2">
          <NuxtLink
            to="/clientes"
            class="text-white text-xs rounded-full px-4 py-1.5 transition-opacity hover:opacity-90"
            style="background-color: #f07030"
          >
            Ver Mais &rsaquo;
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Row 3: Serviços Populares | Controle de Estoque ── -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Serviços Populares -->
    <div class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-4">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Serviços Populares
      </h3>
      <div class="flex items-center gap-5">
        <!-- Donut pie chart via conic-gradient -->
        <div class="relative w-28 h-28 shrink-0">
          <div
            class="w-28 h-28 rounded-full"
            style="
              background: conic-gradient(
                #1d9fb6 0% 35%,
                #4abde8 35% 60%,
                #10b981 60% 80%,
                #9b6bb5 80% 100%
              );
            "
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div
              class="w-14 h-14 bg-white dark:bg-neutral-800 rounded-full"
            ></div>
          </div>
          <span
            class="absolute text-[9px] font-bold text-white"
            style="top: 7px; left: 50%; transform: translateX(-50%)"
            >35%</span
          >
          <span
            class="absolute text-[9px] font-bold text-white"
            style="top: 50%; right: 4px; transform: translateY(-50%)"
            >25%</span
          >
          <span
            class="absolute text-[9px] font-bold text-white"
            style="bottom: 10px; left: 50%; transform: translateX(-50%)"
            >20%</span
          >
          <span
            class="absolute text-[9px] font-bold text-white"
            style="top: 50%; left: 4px; transform: translateY(-50%)"
            >20%</span
          >
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="s in servicosPopulares"
            :key="s.label"
            class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"
          >
            <span
              class="w-3 h-3 rounded-full shrink-0"
              :style="{ backgroundColor: s.color }"
            ></span>
            {{ s.label }} {{ s.percent }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Controle de Estoque -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden flex flex-col"
    >
      <div
        class="flex items-center justify-between px-4 py-2.5"
        style="background-color: #1d9fb6"
      >
        <h3 class="text-white font-semibold text-sm">Controle de Estoque</h3>
        <div class="flex gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-white/50"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-white/50"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-white/50"></span>
        </div>
      </div>
      <div class="p-4 flex flex-col gap-3 flex-1">
        <div
          v-for="item in estoqueResumo"
          :key="item.label"
          class="flex items-center gap-3 text-sm"
        >
          <UIcon
            :name="item.icon"
            class="size-5 shrink-0"
            :style="{ color: item.alerta ? '#E85A5A' : '#1d9fb6' }"
          />
          <span class="text-gray-600 dark:text-gray-300 flex-1"
            >{{ item.label }}:</span
          >
          <span
            class="font-semibold"
            :class="
              item.alerta ? 'text-red-500' : 'text-gray-700 dark:text-gray-100'
            "
            >{{ item.value }}</span
          >
          <UIcon
            v-if="item.alerta"
            name="i-lucide-alert-triangle"
            class="size-3.5 text-amber-500"
          />
        </div>
        <div class="flex justify-between items-center mt-auto pt-2">
          <span
            v-if="totalAlertasEstoque > 0"
            class="text-xs text-amber-600 font-medium"
          >
            {{ totalAlertasEstoque }} produto(s) em alerta
          </span>
          <NuxtLink
            to="/estoque"
            class="text-white text-xs rounded-full px-4 py-1.5 transition-opacity hover:opacity-90 ml-auto"
            style="background-color: #f07030"
          >
            Ver Estoque &rsaquo;
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Row 4: Performance do Mês ── -->
  <div
    class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden"
  >
    <div
      class="flex items-center justify-between px-4 py-2.5"
      style="background-color: #1d9fb6"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-trending-up" class="size-4 text-white" />
        <h3 class="text-white font-semibold text-sm">Performance do Mês</h3>
      </div>
      <span
        class="text-white text-xs bg-white/20 rounded-full px-2 py-0.5 font-semibold"
      >
        {{
          new Date().toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })
        }}
      </span>
    </div>
    <div class="p-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
      <!-- Receitas -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500 dark:text-gray-400 font-medium"
            >Receitas</span
          >
          <span class="text-sm font-bold text-gray-800 dark:text-gray-100">
            {{
              resumo.receitas.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            }}
          </span>
        </div>
        <div
          class="w-full h-2 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden"
        >
          <div
            class="h-full rounded-full transition-all"
            style="background-color: #1d9fb6"
            :style="{ width: percentReceita + '%' }"
          />
        </div>
        <span class="text-[11px] text-gray-400"
          >{{ percentReceita }}% da meta (R$ 8.000)</span
        >
      </div>
      <!-- Despesas -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500 dark:text-gray-400 font-medium"
            >Despesas</span
          >
          <span class="text-sm font-bold text-red-500">
            {{
              resumo.despesas.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            }}
          </span>
        </div>
        <div
          class="w-full h-2 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-red-400 rounded-full transition-all"
            :style="{
              width:
                Math.min(100, Math.round((resumo.despesas / 8000) * 100)) + '%',
            }"
          />
        </div>
        <span class="text-[11px] text-gray-400">Registradas no mês</span>
      </div>
      <!-- Lucro + ações -->
      <div
        class="flex flex-col gap-2 sm:border-l sm:pl-6 border-gray-100 dark:border-neutral-700"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500 dark:text-gray-400 font-medium"
            >Lucro Líquido</span
          >
          <span
            class="text-sm font-bold"
            :class="lucroMes >= 0 ? 'text-emerald-500' : 'text-red-500'"
          >
            {{
              lucroMes.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            }}
          </span>
        </div>
        <div class="mt-auto flex flex-col gap-2 pt-2">
          <NuxtLink
            to="/financeiro"
            class="block text-center text-xs font-semibold py-2 rounded-xl text-white transition-opacity hover:opacity-90"
            style="background-color: #f07030"
            >Ver Financeiro Completo</NuxtLink
          >
          <NuxtLink
            to="/configuracoes/whatsapp"
            class="block text-center text-xs font-semibold py-2 rounded-xl border-2 border-gray-200 dark:border-neutral-600 text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 transition-colors"
            >Enviar Promoção via WhatsApp</NuxtLink
          >
        </div>
      </div>
    </div>
  </div>
</template>
