<script setup lang="ts">
definePageMeta({
  layout: false,
});

const menuItems = [
  {
    label: "Dashboard",
    icon: "i-lucide-layout-dashboard",
    to: "/dashboard",
    active: true,
  },
  { label: "Clientes", icon: "i-lucide-users", to: "/clientes", active: false },
  { label: "Agenda", icon: "i-lucide-calendar", to: "/agenda", active: false },
  {
    label: "Serviços",
    icon: "i-lucide-briefcase",
    to: "/servicos",
    active: false,
  },
  {
    label: "Relatórios",
    icon: "i-lucide-bar-chart-2",
    to: "/relatorios",
    active: false,
  },
];

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
    lines: ["Pets Hospedados"],
    value: "5",
    icon: "i-lucide-house",
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
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background-color: #d6edfa">
    <!-- ===== HEADER ===== -->
    <header
      class="flex items-center gap-4 px-6 py-3 shadow"
      style="background-color: #5ab5e0"
    >
      <!-- Logo -->
      <div class="flex items-center gap-2 mr-4 shrink-0">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center"
          style="background-color: #fff3e0"
        >
          <UIcon name="i-lucide-dog" class="size-6" style="color: #5ab5e0" />
        </div>
        <span class="text-white font-bold text-base leading-none">
          Annin Pet <span class="font-light">Simples</span>
        </span>
      </div>

      <!-- Search -->
      <div class="flex-1 max-w-xs">
        <UInput
          placeholder="Buscar..."
          leading-icon="i-lucide-search"
          size="sm"
          class="rounded-full bg-white"
        />
      </div>

      <!-- Right actions -->
      <div class="flex items-center gap-3 ml-auto">
        <button
          class="text-white hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/20"
        >
          <UIcon name="i-lucide-mail" class="size-5" />
        </button>

        <div class="relative">
          <button
            class="text-white hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/20"
          >
            <UIcon name="i-lucide-bell" class="size-5" />
          </button>
          <span
            class="absolute -top-0.5 -right-0.5 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
            style="background-color: #f5a523"
            >3</span
          >
        </div>

        <div class="flex items-center gap-2 cursor-pointer group">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style="background-color: #e85a8a"
          >
            AV
          </div>
          <span class="text-white text-sm font-medium">Ana Veterinária</span>
          <UIcon name="i-lucide-chevron-down" class="size-4 text-white/80" />
        </div>
      </div>
    </header>

    <!-- ===== BODY ===== -->
    <div class="flex flex-1 min-h-0">
      <!-- Sidebar -->
      <aside
        class="w-44 shrink-0 m-4 mr-0 bg-white rounded-2xl shadow-sm py-3 flex flex-col gap-0.5"
      >
        <NuxtLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          class="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
          :style="
            item.active
              ? 'background-color:#4AADE8; color:#fff;'
              : 'color:#6b7280;'
          "
          :class="!item.active ? 'hover:bg-blue-50' : ''"
        >
          <UIcon :name="item.icon" class="size-4.5 shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-4 overflow-auto flex flex-col gap-4">
        <!-- ── Row 1: Stats ── -->
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="stat in stats"
            :key="stat.lines[0]"
            class="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
          >
            <div>
              <p class="text-xs text-gray-500 leading-snug">
                <span v-for="(line, i) in stat.lines" :key="i">
                  {{ line }}<br v-if="i < stat.lines.length - 1" />
                </span>
              </p>
              <p
                class="text-3xl font-extrabold text-gray-800 mt-1 leading-none"
              >
                {{ stat.value }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              :style="{ backgroundColor: stat.bgColor }"
            >
              <UIcon
                :name="stat.icon"
                class="size-6"
                :style="{ color: stat.iconColor }"
              />
            </div>
          </div>
        </div>

        <!-- ── Row 2: Agenda | Cadastros | Decorative ── -->
        <div class="grid gap-4" style="grid-template-columns: 1fr 1fr 200px">
          <!-- Agenda de Hoje -->
          <div
            class="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col"
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
                <span class="text-gray-500 font-medium w-12 shrink-0">{{
                  item.time
                }}</span>
                <span
                  :class="item.highlight ? 'font-semibold' : 'text-gray-700'"
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

          <!-- Últimos Cadastros -->
          <div
            class="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col"
          >
            <div
              class="flex items-center justify-between px-4 py-2.5"
              style="background-color: #f5a523"
            >
              <h3 class="text-white font-semibold text-sm">
                Últimos Cadastros
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
                class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-1 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 shrink-0"
                    :style="{ backgroundColor: c.bg }"
                  >
                    {{ c.initials }}
                  </div>
                  <span class="text-sm text-gray-700">{{ c.name }}</span>
                </div>
                <UIcon
                  name="i-lucide-chevron-right"
                  class="size-4 text-gray-400"
                />
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

          <!-- Decorative panels -->
          <div class="flex flex-col gap-4">
            <!-- Paw pattern panel -->
            <div
              class="flex-1 rounded-2xl overflow-hidden flex items-center justify-center"
              style="background-color: #fdf0dc"
            >
              <div class="grid grid-cols-4 gap-2 p-3 opacity-25">
                <UIcon
                  v-for="i in 16"
                  :key="i"
                  name="i-lucide-paw-print"
                  class="size-7"
                  style="color: #c8a050"
                />
              </div>
            </div>
            <!-- Dog illustration panel -->
            <div
              class="flex-1 rounded-2xl overflow-hidden flex items-center justify-center"
              style="background-color: #d6edfa"
            >
              <UIcon
                name="i-lucide-dog"
                class="size-24 opacity-30"
                style="color: #3a8ec8"
              />
            </div>
          </div>
        </div>

        <!-- ── Row 3: Serviços | Estoque | Lembrete ── -->
        <div class="grid grid-cols-3 gap-4">
          <!-- Serviços Populares -->
          <div class="bg-white rounded-2xl shadow-sm p-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">
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
                <!-- Hole to make donut -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-14 h-14 bg-white rounded-full"></div>
                </div>
                <!-- Percentage labels approximately positioned -->
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

              <!-- Legend -->
              <div class="flex flex-col gap-2">
                <div
                  v-for="s in servicosPopulares"
                  :key="s.label"
                  class="flex items-center gap-2 text-xs text-gray-600"
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
            class="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col"
          >
            <div
              class="flex items-center justify-between px-4 py-2.5"
              style="background-color: #4aade8"
            >
              <h3 class="text-white font-semibold text-sm">
                Controle de Estoque
              </h3>
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
                <span class="text-gray-600 flex-1">{{ item.label }}:</span>
                <span class="font-semibold text-gray-700">{{
                  item.value
                }}</span>
              </div>
            </div>
          </div>

          <!-- Lembrete Rápido -->
          <div
            class="rounded-2xl shadow-sm p-4 flex flex-col"
            style="background-color: #fff8cc"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold" style="color: #b8860b">
                Lembrete Rápido
              </h3>
              <UIcon
                name="i-lucide-paw-print"
                class="size-5"
                style="color: #d4a020"
              />
            </div>
            <div class="flex-1 flex flex-col justify-center">
              <p class="text-sm leading-relaxed" style="color: #7c6010">
                Lembrar:<br />
                <span class="font-bold text-base" style="color: #5c4500"
                  >Reposição de vacinas!</span
                >
              </p>
            </div>
            <div class="flex justify-end mt-4">
              <UIcon
                name="i-lucide-paw-print"
                class="size-7 opacity-30"
                style="color: #b8860b"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
