<script setup lang="ts">
useBreadcrumb().set([{ label: "Vacinas" }]);

type StatusVacina = "urgente" | "proximo" | "vencida" | "ok";

const vacinas = ref([
  {
    pet: "Rex",
    dono: "João Silva",
    vacina: "V10",
    lote: "ABC123",
    aplicada: "20/03/2025",
    vence: "20/03/2026",
    status: "urgente" as StatusVacina,
  },
  {
    pet: "Luna",
    dono: "Maria Souza",
    vacina: "Antirrábica",
    lote: "DEF456",
    aplicada: "22/03/2025",
    vence: "22/03/2026",
    status: "urgente" as StatusVacina,
  },
  {
    pet: "Nina",
    dono: "Carlos Lima",
    vacina: "Giárdia",
    lote: "GHI789",
    aplicada: "28/03/2025",
    vence: "28/03/2026",
    status: "proximo" as StatusVacina,
  },
  {
    pet: "Thor",
    dono: "Pedro Alves",
    vacina: "V8",
    lote: "JKL012",
    aplicada: "02/04/2025",
    vence: "02/04/2026",
    status: "proximo" as StatusVacina,
  },
  {
    pet: "Mel",
    dono: "Ana Costa",
    vacina: "V10",
    lote: "MNO345",
    aplicada: "15/01/2025",
    vence: "15/01/2026",
    status: "vencida" as StatusVacina,
  },
  {
    pet: "Bob",
    dono: "Lucas Ferreira",
    vacina: "Antirrábica",
    lote: "PQR678",
    aplicada: "10/06/2025",
    vence: "10/06/2026",
    status: "ok" as StatusVacina,
  },
]);

const busca = ref("");

const vacinasFiltradas = computed(() =>
  vacinas.value.filter(
    (v) =>
      v.pet.toLowerCase().includes(busca.value.toLowerCase()) ||
      v.dono.toLowerCase().includes(busca.value.toLowerCase()) ||
      v.vacina.toLowerCase().includes(busca.value.toLowerCase()),
  ),
);

const statusConfig: Record<
  StatusVacina,
  { label: string; bg: string; text: string }
> = {
  urgente: {
    label: "Urgente",
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-600 dark:text-red-400",
  },
  proximo: {
    label: "Próximo",
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-600 dark:text-amber-400",
  },
  vencida: {
    label: "Vencida",
    bg: "bg-gray-100 dark:bg-neutral-700",
    text: "text-gray-500 dark:text-gray-400",
  },
  ok: {
    label: "Em dia",
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-600 dark:text-green-400",
  },
};

const resumoCards = computed(() => [
  {
    label: "Total de Registros",
    value: vacinas.value.length,
    icon: "i-lucide-syringe",
    bg: "#D1FAE5",
    color: "#10B981",
  },
  {
    label: "Urgentes",
    value: vacinas.value.filter((v) => v.status === "urgente").length,
    icon: "i-lucide-alert-circle",
    bg: "#FFE0E0",
    color: "#E85A5A",
  },
  {
    label: "Próximos (30 dias)",
    value: vacinas.value.filter((v) => v.status === "proximo").length,
    icon: "i-lucide-clock",
    bg: "#FFF3E0",
    color: "#8B5CF6",
  },
  {
    label: "Vencidas",
    value: vacinas.value.filter((v) => v.status === "vencida").length,
    icon: "i-lucide-x-circle",
    bg: "#F0F0F0",
    color: "#9ca3af",
  },
]);
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header da página -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Vacinas
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Controle de vacinação dos pets cadastrados
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        label="Registrar Vacina"
        style="background-color: #f07030"
        class="text-white"
      />
    </div>

    <!-- Cards de resumo -->
    <div class="grid grid-cols-4 gap-4">
      <div
        v-for="item in resumoCards"
        :key="item.label"
        class="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
      >
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ item.label }}
          </p>
          <p
            class="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-1 leading-none"
          >
            {{ item.value }}
          </p>
        </div>
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          :style="{ backgroundColor: item.bg }"
        >
          <UIcon
            :name="item.icon"
            class="size-6"
            :style="{ color: item.color }"
          />
        </div>
      </div>
    </div>

    <!-- Tabela -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden"
    >
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-700"
      >
        <UInput
          v-model="busca"
          placeholder="Buscar por pet, dono ou vacina..."
          leading-icon="i-lucide-search"
          size="sm"
          class="max-w-xs"
        />
      </div>

      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 dark:border-neutral-700">
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              Pet
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              Dono
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              Vacina
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              Lote
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              Aplicada
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              Vencimento
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              Status
            </th>
            <th
              class="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="v in vacinasFiltradas"
            :key="v.pet + v.vacina"
            class="border-b border-gray-50 dark:border-neutral-700 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
          >
            <td
              class="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100"
            >
              {{ v.pet }}
            </td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-300">
              {{ v.dono }}
            </td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-200">
              {{ v.vacina }}
            </td>
            <td
              class="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs"
            >
              {{ v.lote }}
            </td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-300">
              {{ v.aplicada }}
            </td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-300">
              {{ v.vence }}
            </td>
            <td class="px-4 py-3">
              <span
                class="text-xs font-semibold rounded-full px-2.5 py-1"
                :class="[
                  statusConfig[v.status].bg,
                  statusConfig[v.status].text,
                ]"
              >
                {{ statusConfig[v.status].label }}
              </span>
            </td>
            <td class="px-4 py-3">
              <UButton
                icon="i-lucide-pencil"
                color="neutral"
                variant="ghost"
                size="xs"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
