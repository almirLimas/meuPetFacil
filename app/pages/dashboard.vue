<script setup lang="ts">
const stats = [
  {
    lines: ["Clientes Ativos"],
    value: "120",
    icon: "i-lucide-users",
    bgColor: "#FFF0E0",
    iconColor: "#F5A523",
  },
  {
    lines: ["Próximos", "Agendamentos"],
    value: "8",
    icon: "i-lucide-calendar",
    bgColor: "#E0F0FF",
    iconColor: "#4AADE8",
  },
  {
    lines: ["Pets Cadastrados"],
    value: "5",
    icon: "i-lucide-paw-print",
    bgColor: "#FFE0EC",
    iconColor: "#E85A8A",
  },
  {
    lines: ["Vendas do Mês"],
    value: "R$ 7.520",
    icon: "i-lucide-bar-chart-2",
    bgColor: "#E0FBF4",
    iconColor: "#2CC0A0",
  },
];

const agendaItems = [
  { time: "09:00", service: "Banho", pet: "Rex", highlight: true },
  { time: "10:30", service: "Consulta", pet: "Luna", highlight: true },
  { time: "13:00", service: "Tosa", pet: "Nina", highlight: true },
  { time: "15:00", service: "Vacinação", pet: "Bob", highlight: false },
];

const cadastros = [
  { name: "Laura & Mia", initials: "L", bg: "#F9C5D1" },
  { name: "Pedro & Thor", initials: "P", bg: "#B5E5C8" },
  { name: "Mariana & Billy", initials: "M", bg: "#FFDAAA" },
  { name: "Carlos & Mel", initials: "C", bg: "#AACFF5" },
];

const servicosPopulares = [
  { label: "Banho", percent: 35, color: "#F5A523" },
  { label: "Tosa", percent: 25, color: "#4ABDE8" },
  { label: "Consulta", percent: 20, color: "#5CC86B" },
  { label: "Hospedagem", percent: 20, color: "#9B6BB5" },
];

const estoque = [
  { icon: "i-lucide-beef", label: "Ração Cães", value: "8 kg" },
  { icon: "i-lucide-beef", label: "Ração Gatos", value: "5 kg" },
  { icon: "i-lucide-droplets", label: "Shampoo", value: "12 un." },
  { icon: "i-lucide-toy-brick", label: "Brinquedos", value: "30 un." },
];

const lembretesVacinas = [
  {
    pet: "Rex",
    dono: "João Silva",
    vacina: "V10",
    vence: "20/03/2026",
    urgente: true,
  },
  {
    pet: "Luna",
    dono: "Maria Souza",
    vacina: "Antirrábica",
    vence: "22/03/2026",
    urgente: true,
  },
  {
    pet: "Nina",
    dono: "Carlos Lima",
    vacina: "Giárdia",
    vence: "28/03/2026",
    urgente: false,
  },
  {
    pet: "Thor",
    dono: "Pedro Alves",
    vacina: "V8",
    vence: "02/04/2026",
    urgente: false,
  },
];
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
      style="background-color: #f5a523"
    >
      <UIcon name="i-lucide-user-plus" class="size-4" />
      Novo Cliente
    </NuxtLink>
    <button
      class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
      style="background-color: #4aade8"
    >
      <UIcon name="i-lucide-calendar-plus" class="size-4" />
      Novo Agendamento
    </button>
    <button
      class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
      style="background-color: #5cc86b"
    >
      <UIcon name="i-lucide-syringe" class="size-4" />
      Registrar Vacina
    </button>
  </div>

  <!-- ── Row 2: Agenda | Últimos Clientes ── -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Agenda de Hoje -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden flex flex-col"
    >
      <div
        class="flex items-center justify-between px-4 py-2.5"
        style="background-color: #4aade8"
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
          <span
            :class="
              item.highlight
                ? 'font-semibold'
                : 'text-gray-700 dark:text-gray-300'
            "
            :style="item.highlight ? 'color:#4AADE8;' : ''"
          >
            {{ item.service }} - {{ item.pet }}
          </span>
        </div>
        <div class="flex justify-end mt-auto pt-2">
          <button
            class="text-white text-xs rounded-full px-4 py-1.5 transition-opacity hover:opacity-90"
            style="background-color: #4aade8"
          >
            Ver Todas &rsaquo;
          </button>
        </div>
      </div>
    </div>

    <!-- Últimos Clientes Cadastrados -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden flex flex-col"
    >
      <div
        class="flex items-center justify-between px-4 py-2.5"
        style="background-color: #f5a523"
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
          v-for="c in cadastros"
          :key="c.name"
          class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-neutral-700 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg px-1 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200 shrink-0"
              :style="{ backgroundColor: c.bg }"
            >
              {{ c.initials }}
            </div>
            <span class="text-sm text-gray-700 dark:text-gray-200">{{
              c.name
            }}</span>
          </div>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-gray-400" />
        </div>
        <div class="flex justify-end mt-auto pt-2">
          <button
            class="text-sm font-medium hover:opacity-70 transition-opacity"
            style="color: #f5a523"
          >
            Ver Mais &rsaquo;
          </button>
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
                #f5a523 0% 35%,
                #4abde8 35% 60%,
                #5cc86b 60% 80%,
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
        style="background-color: #4aade8"
      >
        <h3 class="text-white font-semibold text-sm">Controle de Estoque</h3>
        <div class="flex gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-white/50"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-white/50"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-white/50"></span>
        </div>
      </div>
      <div class="p-4 flex flex-col gap-3">
        <div
          v-for="item in estoque"
          :key="item.label"
          class="flex items-center gap-3 text-sm"
        >
          <UIcon
            :name="item.icon"
            class="size-5 shrink-0"
            style="color: #4aade8"
          />
          <span class="text-gray-600 dark:text-gray-300 flex-1"
            >{{ item.label }}:</span
          >
          <span class="font-semibold text-gray-700 dark:text-gray-100">{{
            item.value
          }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Row 4: Lembretes de Vacinas ── -->
  <div
    class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden"
  >
    <div
      class="flex items-center justify-between px-4 py-2.5"
      style="background-color: #5cc86b"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-syringe" class="size-4 text-white" />
        <h3 class="text-white font-semibold text-sm">Lembretes de Vacinas</h3>
      </div>
      <span
        class="text-white text-xs font-semibold bg-white/20 rounded-full px-2 py-0.5"
        >{{ lembretesVacinas.filter((v) => v.urgente).length }} urgentes</span
      >
    </div>
    <div class="p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="v in lembretesVacinas"
          :key="v.pet + v.vacina"
          class="rounded-xl p-3 flex flex-col gap-1.5 border transition-colors"
          :class="
            v.urgente
              ? 'border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800'
              : 'border-gray-100 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700'
          "
        >
          <div class="flex items-center justify-between">
            <span
              class="font-semibold text-sm text-gray-800 dark:text-gray-100"
              >{{ v.pet }}</span
            >
            <span
              v-if="v.urgente"
              class="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/50 rounded-full px-1.5 py-0.5"
              >Urgente</span
            >
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{
            v.dono
          }}</span>
          <div class="flex items-center gap-1 mt-0.5">
            <UIcon
              name="i-lucide-syringe"
              class="size-3.5 shrink-0"
              style="color: #5cc86b"
            />
            <span
              class="text-xs font-medium text-gray-700 dark:text-gray-300"
              >{{ v.vacina }}</span
            >
          </div>
          <div class="flex items-center gap-1">
            <UIcon
              name="i-lucide-calendar"
              class="size-3.5 text-gray-400 shrink-0"
            />
            <span class="text-xs text-gray-500 dark:text-gray-400">{{
              v.vence
            }}</span>
          </div>
        </div>
      </div>
      <div class="flex justify-end mt-3">
        <NuxtLink
          to="/vacinas"
          class="text-xs font-medium hover:opacity-70 transition-opacity"
          style="color: #5cc86b"
        >
          Ver Todas as Vacinas &rsaquo;
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
